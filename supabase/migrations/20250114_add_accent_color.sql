-- Add accent_color column to site_settings table
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) NOT NULL DEFAULT '#1e3a5f';

-- Add comment
COMMENT ON COLUMN site_settings.accent_color IS 'Accent color for the site theme (hex code)';
