require "tmpdir"
require "cgi"
require "time"
require "functions_framework"
require "google/cloud/storage"
require "google/cloud/firestore"
require "./windsond-data-parser"

FIRESTORE_COLLECTION = "sondeview"
DOWNLOAD_DATA_COLLECTION = "download_data"

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
    data[:altitude] = nil
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