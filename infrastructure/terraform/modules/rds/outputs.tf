output "identifier" {
  value = aws_db_instance.database.identifier
}

output "endpoint" {
  value = aws_db_instance.database.address
}

output "port" {
  value = aws_db_instance.database.port
}

output "database_name" {
  value = aws_db_instance.database.db_name
}

output "security_group_id" {
  value = aws_security_group.database.id
}
