-- Manual payment methods: crypto name, wallet address, QR code
USE noonshop;

CREATE TABLE IF NOT EXISTS manual_payment_methods (
  id VARCHAR(191) NOT NULL,
  crypto_name VARCHAR(100) NOT NULL,
  wallet_address VARCHAR(500) NOT NULL,
  qr_code_url VARCHAR(500) NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
);
