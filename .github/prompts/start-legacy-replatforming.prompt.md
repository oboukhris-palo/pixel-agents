
# Start Legacy Replatforming Project

We will create a new AI-PDLC project, that will be a legacy replatforming project. 

## Questions to Ask

Ask the following questions BEFORE proceeding. DO NOT PROCEED WITHOUT THE ANSWER TO THESE QUESTIONS:

1. **Project goals and requirements**:
   - What are the project goals and requirements?
   - What are the key features of the legacy app that need to be replatformed?
   - Are there any specific requirements for the project, like compliance, security, etc.?

2. **Infrastructure**:
    - Which cloud provider will we be using?
    - What is the target architecture for the project?
    - Do you want to create the infrastructure files, and in which format (e.g., Terraform, CloudFormation)?

3. **Legacy App**:
    - What is the legacy app that needs to be replatformed?
    - What are the key challenges in replatforming the legacy app?
    - Are there connections (e.g. interfaces to other systems) that need to be maintained? Where do I find the documentation for these?
    - Is there any specific requirement for the legacy app replatforming process? (like keeping the same data structure, maintaining the same user experience, etc.)

4. **Project Type**:
    - Will this be an API-first project or a frontend first project?
    - Are there any requirements for the API, like being RESTful, GraphQL, etc.?
    - Is there any need for specific languages or frameworks for the frontend or backend?
    - Are there any specific requirements for the database or data storage?

## Actions Based on Answers
1. **Create Project Structure**:
    - Create the project structure based on the answers. This is the default Project Structure that you need to amend:

```
.
├── README.md
├── LegacyApps/ -- Contains the legacy app to be replatformed
│   ├── legacy-app/ -- Contains the legacy app code
│   └── docs/ -- Contains documentation for the legacy app
├── scripts/ -- Contains scripts to manage the project
│   ├── manage.sh -- Manages servers and services (start,stop,status)
│   ├── setup.sh -- Installs project dependencies
│   ├── init_db.sh -- Initializes the database (if required)
├── apps/ -- Contains the frontend application
│   ├── mobile/ -- Contains the mobile application
│   └── web/ -- Contains the web application
├── backend/ -- Contains the backend application
│   ├── api/ -- Contains the API code
│   ├── services/ -- Contains the services code
│   ├── data/ -- Contains the data access code (e.g., database, SQL, ORM, etc.)
│   └── docs/ -- Contains backend documentation
├── docs/ -- Contains project documentation
│   ├── features/ -- Contains documentation for project features (one file per feature)
│   ├── project-overview/ -- Contains an overview of the project
│   ├── meeting-transcripts/ -- Contains transcripts of project meetings & Mob Programming sessions
│   ├── index.md -- Main documentation file, indexing all other documentation
│   └── CONTRIBUTE.md -- Describes the project structure and best practices for contributions
├── infra/ -- Contains infrastructure code
│   ├── modules/ -- Contains Terraform modules
└── services/ -- Contains serverless functions
    └── functions/ -- Contains the serverless functions
```
    - Update the README.md file, `./docs/index.md` file, and `./infra/docs/feature/authentication/index.md` file with the information gathered.

2. **Create TODO.md**:
    - Create the TODO.md file and split it in a way that makes sense for this project.
    - Add tasks for each area of the project, like frontend, backend, infra, etc.
    - Ensure tasks are detailed and small enough to be done in a few hours.
    - Include tasks outside of development, like DevOps tasks, security tasks, etc.
    - Add lines regarding reviewing all generated files (like Architecture or API doc) and updating them as needed.

3. **Create Legacy App Documentation**:
    - Create documentation for the legacy app that needs to be replatformed. Store this in the `./docs/legacy-app` folder.
    - Include information about the legacy app architecture, data structure, user experience, and any other relevant details.
    - Add links to any existing documentation or resources related to the legacy app.
    - Generate list of features to be replatformed, and use it to create a list of tasks in the TODO.md file. Add this list, with a clear description of the features, in the `./docs/features` folder, one file per feature. Add a link to these files in the `./docs/index.md` file.
    - Use your best judgement, and create a list of critical features to be implemented first. Add this list, with a clear description of the features, in the `./docs/CricialFeatures.md`
    - Add a section in the README.md file for the legacy app documentation.
    - Add a section in the docs/ folder for the legacy app documentation.
    - If things are unclear or incoherent, ask for clarification from the project stakeholders. (using the issue tracker docs/issue-tracker.md)

4. **Create Infrastructure Documentation**:
    - If infrastructure files are required, create documentation for the infrastructure architecture. Create the infrastructure files in the `./infra` folder.
    - Include information about the cloud provider, target architecture, and any specific requirements for the infrastructure into the `./docs/infrastructure.md` file.
    - Add diagrams or visual representations of the infrastructure architecture. Use PlantUML to create the diagrams. Store the diagrams in the `./docs/infrastructure` folder.

5. **Create API Documentation**:
    - If the project is API-first, create documentation for the API architecture. Create the API documentation files in the swagger format, under the `./docs/api` folder. Add examples of API requests and responses to illustrate the API functionality.
    - Ensure to align with the Legacy App documentation to understand the API requirements (if the Legacy App does not have an API, gather requirements from the available code and documentation)
    - Include information about the API endpoints, data models, authentication mechanisms, and any other relevant details. Add this information to the `./docs/api.md` file.
    

6. **Create frontend Documentation**:
    - If the project is frontend first, create documentation for the frontend architecture. Create the frontend documentation files in the markdown format, under the `./docs/frontend` folder.
    - Include information about the frontend frameworks, libraries, and components used in the project.
    - Retrieve information on frontend and capabilities from the legacy app code and documentation. 

7. **Create backend Documentation**:
    - Create documentation for the backend architecture. Create the backend documentation files in the markdown format, under the `./docs/backend` folder.
    - Include information about the backend services, data access layer, and any other relevant details. Add this information to the `./docs/backend.md` file.
    - Retrieve information on backend capabilities from the legacy app code and documentation.

8. **Create Testing Strategy**:
    - Create a testing strategy for the project. Create the testing strategy files in the markdown format, under the `./docs/testing` folder.
    - Include information about the testing frameworks, tools, and methodologies used in the project.
    - Define the testing scope, including unit tests, integration tests, end-to-end tests, and any other relevant tests. Add this information to the `./docs/testing.md` file.
    - Add a section in the README.md file for the testing strategy.

9. **Create Deployment Strategy**:
    - Create a deployment strategy for the project. Create the deployment strategy files in the markdown format, under the `./docs/deployment` folder.
    - Include information about the deployment pipelines, environments, and tools used in the project.
    - Define the deployment process, including continuous integration, continuous deployment, and any other relevant processes. Add this information to the `./docs/deployment.md` file.
    - Add a section in the README.md file for the deployment strategy.

10. **Create Monitoring and Logging Strategy**:
    - Create a monitoring and logging strategy for the project. Create the monitoring and logging strategy files in the markdown format, under the `./docs/monitoring` folder.
    - Include information about the monitoring tools, logging frameworks, and alerting mechanisms used in the project. Add this information to the `./docs/monitoring.md` file.
    - Define the monitoring and logging requirements, including performance metrics, error tracking, and any other relevant data.
    - Add a section in the README.md file for the monitoring and logging strategy.

11. **Create Security Strategy**:
    - Create a security strategy for the project. Create the security strategy files in the markdown format, under the `./docs/security` folder.
    - Include information about the security tools, best practices, and compliance requirements used in the project. Add this information to the `./docs/security.md` file.
    - Define the security measures, including data encryption, access control, and any other relevant security features.
    - Add a section in the README.md file for the security strategy.

12. **Create deployment pipeline**:
    - Set up a deployment pipeline using a CI/CD service like GitHub Actions, GitLab CI, or Jenkins. Create the deployment pipeline files in the markdown format, under the `./docs/deployment-pipeline` folder.
    - Define the deployment stages, including build, test, deploy, and any other relevant stages. Add this information to the `./docs/deployment-pipeline.md` file.
    - Configure the deployment pipeline to trigger on code changes, pull requests, or other events.
    - Add a section in the README.md file for the deployment pipeline.

13. **Create Migration Plan & Data Migration Strategy**:
    - Create a migration plan for the legacy app replatforming. Create the migration plan files in the markdown format, under the `./docs/migration` folder.
    - Include information about the data migration strategy, tools, and processes used in the project. Add this information to the `./docs/migration.md` file.
    - Define the migration steps, including data extraction, transformation, loading, and any other relevant steps.
    - Add a section in the README.md file for the migration plan and data migration strategy.

14. **Create Rollback Plan**:
    - Create a rollback plan for the project. Create the rollback plan files in the markdown format, under the `./docs/rollback` folder.
    - Include information about the rollback procedures, triggers, and criteria used in the project. Add this information to the `./docs/rollback.md` file.
    - Define the rollback steps, including reverting changes, restoring backups, and any other relevant steps.
    - Add a section in the README.md file for the rollback plan.

15. **Create Development Environment Setup**:
    - Create guidelines for setting up the development environment. Create the development environment setup files in the markdown format, under the `./docs/development-environment` folder.
    - Include information about the development tools, IDEs, and dependencies used in the project. Add this information to the `./docs/development-environment.md` file.
    - Define the development environment setup process, including installing dependencies, configuring tools, and any other relevant steps.
    - Add a section in the README.md file for the development environment setup.

## Final Steps
1. **Project Name**:
   - Suggest a project name and ask if it's ok to create the project. If the user agrees, create the project with the name suggested.

2. **Review**:
   - Once all the other files are created, and you're clear on the requirements, review the gitignore files, as you might want to add more (like venv or node_modules).

3. **Check File Creation**:
   - Ensure that all the necessary files and folders have been created as per the project structure.

4. **Deploy Requirements**:
   - Run the necessary commands to deploy all the dependencies listed in the requirements files (e.g., `npm install` for Node.js, `pip install -r requirements.txt` for Python).