locals {
  name = "${var.project_name}-${var.environment}"
}

resource "aws_security_group" "database" {
  name        = "${local.name}-rds-sg"
  description = "Allow PostgreSQL access from EKS private subnets."
  vpc_id      = var.vpc_id

  ingress {
    description = "PostgreSQL from EKS private subnets"
    from_port   = var.port
    to_port     = var.port
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name}-rds-sg"
  }
}

resource "aws_db_subnet_group" "database" {
  name       = "${local.name}-rds-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${local.name}-rds-subnet-group"
  }
}

resource "aws_db_instance" "database" {
  identifier = "${local.name}-postgres"

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage = var.allocated_storage
  storage_type      = var.storage_type
  storage_encrypted = true

  db_name  = var.database_name
  username = var.database_username
  password = var.database_password
  port     = var.port

  db_subnet_group_name   = aws_db_subnet_group.database.name
  vpc_security_group_ids = [aws_security_group.database.id]
  publicly_accessible    = false
  multi_az               = var.multi_az

  backup_retention_period = var.backup_retention_period
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = var.skip_final_snapshot

  auto_minor_version_upgrade = true
  copy_tags_to_snapshot      = true

  tags = {
    Name = "${local.name}-postgres"
  }
}
