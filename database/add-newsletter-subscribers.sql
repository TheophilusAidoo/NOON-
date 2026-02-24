-- Newsletter subscribers for "Stay in the loop" footer form
USE noonshop;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY newsletter_subscribers_email_key (email)
);
