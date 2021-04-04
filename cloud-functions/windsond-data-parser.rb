require "time"
require "json"
require "./unit_conv"

class WindsondDataParser
    FIELD_SEPARATOR = "\t"
    WINDSOND_HEADER = "# Radiation correction"

    attr_reader :values, :lat, :lng, :measured_at

    def initialize
        @alt_col = nil
        @alt_unit = nil
        @height_col = nil
        @height_unit = nil
        @windheading_col = nil
        @windheading_col = nil
        @windheading_type = :true_deg
        @wind_from_to_type = :to
        @windspeed_col = nil
        @windspeed_unit = nil
        @temperature_col = nil
        @lat = nil
        @lng = nil
        @measured_at = nil
        @mag_dec = 0
        @values = []
    end

    def valid?(filename)
        s = IO.read(filename, WINDSOND_HEADER.length)
        s == WINDSOND_HEADER
    end

    def parse(filename)
        unless valid?(filename)
            raise "Invalid Windsond csv file"
        end
        header_parsed = false
        IO.foreach(filename) do |line|
            line.chomp!
            if line =~ /^#/
                parse_comment line
            elsif !header_parsed
                parse_header line
                header_parsed = true
            else
                parse_line line
            end
        end
        @values.count
    end

    def to_obj
        data = {
            lat: @lat,
            lng: @lng,
            measured_at: @measured_at,
            mag_dec: @mag_dec,
            values: @values
        }
    end

    def count
        @values.count
    end

    private
    def parse_comment(line)
        if line =~ /lat=(\-?[\d\.]+)/
            @lat = $1.to_f
        end
        if line =~ /lon=(\-?[\-\d\.]+)/
            @lng = $1.to_f
        end
        if line =~ /utc_time=(\d{4}\-\d{2}\-\d{2} \d{2}:\d{2})/
            @measured_at = Time.parse($1 + "+0000")
        end
        if line =~ /mag_dec=(\-?[\d\.]+)/
            @mag_dec = $1.to_f
        end
    end

    def parse_header(line)
        col = 0
        line.split(FIELD_SEPARATOR).each do |field|
            case field
            when "Altitude (ft MSL)"
                @alt_col = col
                @alt_unit = :unit_ft
            when "Altitude (m MSL)"
                if @alt_col.nil?
                    @alt_col = col
                    @alt_unit = :unit_m
                end
            when "Height (ft AGL)"
                @height_col = col
                @height_unit = :unit_ft
            when "Height (m AGL)"
                if @height_col.nil?
                    @height_col = col
                    @height_unit = :unit_m
                end
            when "Wind direction (true deg)"
                if @windheading_col.nil?
                    @winddirection_col = col
                    @winddirection_type = :true_deg
                    @wind_from_to_type = :from
                end
            when "Wind heading (true deg)"
                @windheading_col = col
                @windheading_type = :true_deg
                @wind_from_to_type = :to
            when "Wind heading (magnetic deg)"
                if @windheading_col.nil?
                    @windheading_col = col
                    @windheading_type = :mag_deg
                    @wind_from_to_type = :to
                end
            when "Wind speed (m/s)"
                @windspeed_col = col
                @windspeed_unit = :unit_m_s
            when "Wind speed (kt)"
                if @windspeed_col.nil?
                    @windspeed_col = col
                    @windspeed_unit = :unit_kt
                end
            when "Temperature (C)"
                @temperature_col = col
            end
            col += 1
        end
    end

    def parse_line(line)
        line_values = line.split(FIELD_SEPARATOR)
        data = {}
        if @alt_col
            data[:altitude] = conv_height(line_values[@alt_col].to_f, @alt_unit)
        end
        if @height_col
            data[:height] = conv_height(line_values[@height_col].to_f, @height_unit)
        end
        if @windheading_col
            data[:windheading] = line_values[@windheading_col].to_f
            if @windheading_type == :mag_deg
                data[:windheading] -= @mag_dec
            end
            if @wind_from_to_type == :from
                data[:windheading] -= 180
                if data[:windheading] < 0
                    data[:windheading] += 360
                end
            end
        end
        if @windspeed_col
            data[:windspeed] = conv_windspeed(line_values[@windspeed_col].to_f)
        end
        if @temperature_col
            data[:temperature] = line_values[@temperature_col].to_f
        end
        @values << data
    end

    def conv_height(value, unit)
        if unit == :unit_m
            UnitConv::m_to_ft(value)
        else
            value
        end
    end

    def conv_windspeed(value)
        if @windspeed_unit == :unit_kt
            UnitConv::kt_to_m_s(value)
        else
            value
        end
    end
end