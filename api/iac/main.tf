provider "aws" {
  region                      = "eu-west-1"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  access_key                  = "nothing"
  secret_key                  = "nothing"

  endpoints {
    dynamodb       = "http://localhost:4566"
  }
}

resource "aws_dynamodb_table" "tf_users_table" {
  name             = "users"
  hash_key         = "Username"
  billing_mode = "PROVISIONED"
  read_capacity= "30"
  write_capacity= "30"

  attribute {
    name = "Username"
    type = "S"
  }
}