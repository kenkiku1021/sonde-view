require "tmpdir"
require "functions_framework"
require "google/cloud/storage"
require "google/cloud/firestore"
require "./windsond-data-parser"

FIRESTORE_COLLECTION = "sondeview"

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

def log_error(ex)
  if ex.instance_of? Exception
    msg = ex.message + "\n" + ex.backtrace.join("\n")
  else
    msg = ex
  end
  logger.error msg
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