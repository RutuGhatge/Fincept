from app.graphql.schema import schema
print("Query Fields:")
for field in schema.get_type_by_name("Query").fields:
    print(f"- {field.name}")

print("\nMutation Fields:")
for field in schema.get_type_by_name("Mutation").fields:
    print(f"- {field.name}")
