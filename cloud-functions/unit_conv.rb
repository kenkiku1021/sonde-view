module UnitConv
    def self.m_to_ft(value)
        value / 0.3048
    end

    def self.ft_to_m(value)
        value * 0.3048
    end

    def self.m_s_to_kt(value)
        value * 1.9438
    end

    def self.t_to_m_s(value)
        value * 0.51444
    end
end