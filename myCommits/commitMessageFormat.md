[Type]: [Short Description]

[Body]

[Footer]

[Type]:
- feat: A new feature - This type is used when adding a new feature or functionality to the project.
- fix: A bug fix - This type is used when addressing a bug or issue in the codebase.
- docs: Documentation changes - This type is used for updates or additions to documentation.
- style: Changes that do not affect the meaning of the code (white-space, formatting, etc.) - This type is used for cosmetic changes that don't affect the actual functionality of the code.
- refactor: A code change that neither fixes a bug nor adds a feature - This type is used for code refactoring or restructuring that doesn't change the external behavior of the code.
- test: Adding missing tests - This type is used for adding new tests or improving test coverage.
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation - This type is used for changes that are related to the project's development process rather than the code itself.

[Short Description]:
- A brief summary of the changes in present tense, typically no more than 50 characters. This provides a quick overview of the commit's purpose.

[Body]:
- More detailed explanation of the changes. This can include motivations, context, and any relevant information to understand the commit. The body can be multiple lines and provides additional context for the changes.

[Footer]:
- Additional information like references to issue tracker IDs, breaking changes, deprecations, or other related issues. This section is optional but can be useful for providing further context or linking to related resources.

Example:
feat: Implement user authentication feature

Add user authentication functionality using JSON Web Tokens (JWT) for secure access to the application.

- Implemented login and signup endpoints.
- Integrated JWT token generation and verification.
- Added middleware for authentication checks.
- Enhanced error handling for authentication failures.

This feature addresses the need for secure user access and lays the foundation for future authorization features.

Closes #123
