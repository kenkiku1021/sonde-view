require "tmpdir"
require "cgi"
require "time"
require 'open-uri'
require "json"
require "functions_framework"
require "google/cloud/storage"
require "google/cloud/firestore"
require "./windsond-data-parser"

FIRESTORE_COLLECTION = "sondeview"
DOWNLOAD_DATA_COLLECTION = "download_data"
SYSTEM_SETTING_COLLECTION = "system_setting"

class WindviewAuthError < Exception
end

class WindviewDataError < Exception
  attr_accessor :errors

  def initialize
    @errors = []
  end
end

FunctionsFramework.http "upload_data" do |request|
  authkey = request.get_header("HTTP_X_WINDVIEW_KEY")
  windview_upload_key = ENV["windview_upload_key"]
  if windview_upload_key.nil? || windview_upload_key == ""
    logger.error "ENV[windview_upload_key] is not specified"
  end

  logger.info "data uploaded by http POST"
  begin
    if !windview_upload_key || windview_upload_key == "" || windview_upload_key != authkey
      # auth error
      raise WindviewAuthError
    end
    data = load_data(JSON.parse(request.body.read, symbolize_names: true))
    logger.info "#{data[:values].count} values found"
    key = save_measure_data(data)
    logger.info "data saved (key: #{key})"

    body = {
      errors: nil
    }
    code = 200
  rescue WindviewAuthError => ex
    body = {
      errors: ["Incorrect auth key"],
    }
    code = 401
  rescue WindviewDataError => ex
    body = {
      errors: ex.errors,
    }
    code = 400
  rescue => ex
    log_error ex
    body = {
      errors: ["Unknown error"],
    }
    code = 500
  end

  unless body[:errors].nil?
    body[:errors].each do |err|
      logger.error err
    end
  end
  Rack::Response.new(JSON.generate(body), code, {"Content-Type" => "application/json"})
end

FunctionsFramework.cloud_event "parse_windsond" do |event|
  # parse Windsond data and store into firestore DB
  # Units:
  #  Altitude and Height : ft
  #  WindSpeed : m/s
  #  WindHeading : "TO" and "true heading

  # The event parameter is a CloudEvents::Event::V1 object.
  # See https://cloudevents.github.io/sdk-ruby/latest/CloudEvents/Event/V1.html
  payload = event.data

  storage = Google::Cloud::Storage.new
  bucket = storage.bucket(payload['bucket'])
  file = bucket.file(payload['name'])

  logger.info "file updated in bucket: #{bucket.name}  name: #{file.name}"

  Dir.mktmpdir do |dir|
    basename = File.basename(file.name)

    if basename =~ /sounding\.csv$/
      # windsond data file
      tmpfile = File.join(dir, basename)
      file.download tmpfile
      begin
        parser = WindsondDataParser.new
        if parser.valid?(tmpfile)
          if parser.parse(tmpfile) === 0
            logger.info "empty file"
          else
            logger.info "#{parser.count} values found"
            key = save_measure_data(parser.to_obj)
            logger.info "data saved (key: #{key})"
          end
        end
      rescue => ex
        log_error ex
      end
    end
  end
end

FunctionsFramework.cloud_event "file_uploaded" do |event|
  # store uploaded files into firestore

  # The event parameter is a CloudEvents::Event::V1 object.
  # See https://cloudevents.github.io/sdk-ruby/latest/CloudEvents/Event/V1.html
  payload = event.data

  storage = Google::Cloud::Storage.new
  bucket = storage.bucket(payload['bucket'])
  file = bucket.file(payload['name'])
  file.content_type = "application/octet_stream"
  logger.info "file updated in bucket: #{bucket.name}  name: #{file.name}"

  save_download_data file
end

FunctionsFramework.cloud_event "file_deleted" do |event|
  # delete file info from firestore

  # The event parameter is a CloudEvents::Event::V1 object.
  # See https://cloudevents.github.io/sdk-ruby/latest/CloudEvents/Event/V1.html
  payload = event.data

  storage = Google::Cloud::Storage.new
  #logger.info "Bucket: #{payload['bucket']}"
  #logger.info "File: #{payload['name']}"
  logger.info "file deleteed in bucket: #{payload['bucket']}  name: #{payload['name']}"

  delete_download_data payload['name']
end

FunctionsFramework.cloud_event "sondeview_document_created" do |event|
  # create sondeview document on firestore
  # get location from lat/lng
  # set disabled flag from system_setting
  payload = event.data
  lat = payload["value"]["fields"]["lat"]["doubleValue"]
  lng = payload["value"]["fields"]["lng"]["doubleValue"]
  firestore = Google::Cloud::Firestore.new

  doc_name = event.subject.split("documents/").last
  logger.info "sondeview document created : #{doc_name}"
  doc = firestore.doc(doc_name)
  data_id = doc.get.document_id
  data = doc.get.data.dup
  logger.info data

  location = get_location_from_lat_lng(lat, lng)
  if location
    data["location"] = location
  end
  doc.set data

  # get default disabled or not
  sonde_data_default_disabled_flag_doc = firestore.doc("#{SYSTEM_SETTING_COLLECTION}/sonde_data_default_disabled_flag")
  sonde_data_default_disabled_flag_snapshot = sonde_data_default_disabled_flag_doc.get
  if sonde_data_default_disabled_flag_snapshot.exists?
    sonde_data_default_disabled_flag_data = sonde_data_default_disabled_flag_snapshot.data
    logger.info sonde_data_default_disabled_flag_data.to_s
    sonde_data_default_disabled_flag = sonde_data_default_disabled_flag_data ? sonde_data_default_disabled_flag_snapshot.data[:flag] : false
    logger.info "system_setting/sonde_data_default_disabled_flag: #{sonde_data_default_disabled_flag}"
  else
    logger.info "system_setting/sonde_data_default_disabled_flag not exists"
    sonde_data_default_disabled_flag = false
  end
  
  if sonde_data_default_disabled_flag
    # add data ID to disabled list
    logger.info "append to disabled_sonde_data_id: #{data_id}"
    disabled_list_doc = firestore.doc("#{SYSTEM_SETTING_COLLECTION}/disabled_sonde_data_id")
    disabled_list_snapshot = disabled_list_doc.get
    disabled_list = disabled_list_snapshot.exists? ? disabled_list_snapshot.data[:list] : []
    unless disabled_list.include?(data_id)
      disabled_list << data_id
      disabled_list_doc.set({list: disabled_list})
    end
  end
end

def log_error(ex)
  if ex.instance_of? Exception
    msg = ex.message + "\n" + ex.backtrace.join("\n")
  else
    msg = ex
  end
  logger.error msg
end

def to_f(val)
  unless val.is_a?(Numeric)
    val.tr!("０-９．ー", "0-9.-")
    if val !~ /^[\d\.]+$/
      raise "not numeric value"
    end
    val = val.to_f
  end
  val
end

def load_data(data)
  errors = []

  data[:updated_at] = Time.now 
  begin
    lat = to_f(data[:lat])
    if lat < -90 || lat > 90
      errors << "Invalid latitude value: #{lat}"
    end
    data[:lat] = lat
  rescue => ex
    data[:lat] = nil
  end
  begin
    lng = to_f(data[:lng])
    if lng < -180 || lng > 180
      errors << "Invalid longitude value: #{lng}"
    end
  rescue => ex
    data[:lng] = nil
  end
  begin
    t = Time.parse(data[:measured_at])
    data[:measured_at] = t
  rescue => ex
    errors << "Invalid measured at time"
  end
  begin
    altitude = to_f(data[:altitude])
    data[:altitude] = altitude
  rescue => ex
    data[:altitude] = 0
  end
  begin
    mag_dec = to_f(data[:mag_dec])
    data[:mag_dec] = mag_dec
  rescue => ex
    data[:mag_dec] = 0
  end
  if !data[:values] || data[:values].empty?
    errors << "Empty measured data"
  else
    data[:values].each_index do |i|
      val = data[:values][i]
      if !val[:height].is_a?(Numeric)
        errors << "record #{i} has invalid height value: #{val[:height]}"
      end
      if !val[:windheading].is_a?(Numeric) || val[:windheading] < 0 || val[:windheading] >= 360
        errors << "record #{i} has invalid windheading value: #{val[:windheading]}"
      end
      if !val[:windspeed].is_a?(Numeric) || val[:windspeed] < 0
        errors << "record #{i} has invalid windspeed value: #{val[:windspeed]}"
      end
    end
    data[:values].map! do |val|
      val[:altitude] = data[:altitude] + val[:height]
      val
    end
  end

  unless errors.empty?
    ex = WindviewDataError.new
    ex.errors = errors
    raise ex
  end

  data
end

def get_key(data)
  if data[:measured_at].nil?
    raise "Invalid data format : measured_at field not exist."
  end
  key = data[:measured_at].to_i
  key
end

def save_measure_data(data)
  firestore = Google::Cloud::Firestore.new
  key = get_key(data)
  doc = firestore.doc("#{FIRESTORE_COLLECTION}/#{key}")
  doc.set data
  key
end

def save_download_data(file)
  firestore = Google::Cloud::Firestore.new
  key = file.name
  doc = firestore.doc("#{DOWNLOAD_DATA_COLLECTION}/#{key}")
  file_item = {name: file.name, updated_at: file.updated_at, size: file.size, url: file.public_url}
  doc.set file_item
  key
end

def delete_download_data(filename)
  firestore = Google::Cloud::Firestore.new
  key = filename
  doc = firestore.doc("#{DOWNLOAD_DATA_COLLECTION}/#{key}")
  doc.delete
  key
end

def get_location_from_lat_lng(lat, lng)
  api_key = ENV["GEOCODING_API_KEY"]
  if api_key.nil? || api_key == ""
    raise "API Key not specified"
  end

  logger.info "get location from lat/lng (lat: #{lat}, lng: #{lng})"
  location = nil
  url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=#{lat},#{lng}&key=#{api_key}"
  URI.open(url) do |f|
    data = JSON.parse(f.read, symbolize_names: true)
    if data && data[:results]
      location = data[:results].first
    end
  end

  location
end