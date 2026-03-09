---
applyTo: '*.java'
---

# Java Spring Boot Development Rules

## Purpose

These rules define standards for developing Java applications using Spring Boot framework to ensure consistency, maintainability, and adherence to best practices. They cover Spring Boot application structure, coding conventions, testing strategies, and architectural patterns.

## Framework and Technology Stack

- Java 17 or later as the primary programming language
- Spring Boot 3.x as the main framework
- Spring Framework for dependency injection and core functionality
- Maven for dependency management and build processes
- JUnit 5 for unit and integration testing
- Spring Data JPA for database operations
- Spring Security for authentication and authorization

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/company/project/
│   │       ├── Application.java              # Main Spring Boot application class
│   │       ├── config/                       # Configuration classes
│   │       ├── controller/                   # REST controllers
│   │       ├── service/                      # Business logic services
│   │       ├── repository/                   # Data access layer
│   │       ├── model/                        # Entity classes
│   │       ├── dto/                          # Data Transfer Objects
│   │       ├── exception/                    # Custom exceptions
│   │       └── util/                         # Utility classes
│   └── resources/
│       ├── application.yml                   # Main configuration
│       ├── application-dev.yml               # Development profile
│       ├── application-test.yml              # Test profile
│       └── application-prod.yml              # Production profile
└── test/
    └── java/
        └── com/company/project/
            ├── controller/                   # Controller tests
            ├── service/                      # Service tests
            └── repository/                   # Repository tests
```

## Code Style and Structure

### Java Programming Standards

1. **Java Version and Features**
   - Use Java 17 or later features when applicable
   - Leverage records for immutable data classes
   - Use sealed classes for restricted inheritance hierarchies
   - Implement pattern matching for instanceof checks
   - Use text blocks for multi-line strings

2. **Code Organization**
   - Write clean, efficient, and well-documented Java code
   - Use descriptive method and variable names following camelCase convention
   - Implement proper exception handling with meaningful error messages
   - Follow SOLID principles and maintain high cohesion and low coupling

3. **Documentation**
   - Use Javadoc for public methods and classes
   - Include meaningful comments for complex business logic
   - Document API endpoints with OpenAPI annotations

### Spring Boot Application Structure

1. **Layered Architecture**
   - **Controllers**: Handle HTTP requests and responses
   - **Services**: Contain business logic and orchestration
   - **Repositories**: Manage data access and persistence
   - **Models**: Define entity classes and DTOs
   - **Configurations**: Application configuration and beans

2. **Package Organization**
   - Group related functionality in appropriate packages
   - Use consistent package naming conventions
   - Separate concerns across different layers

## Spring Boot Specifics

### Application Configuration

1. **Main Application Class**
   ```java
   @SpringBootApplication
   public class Application {
       public static void main(String[] args) {
           SpringApplication.run(Application.class, args);
       }
   }
   ```

2. **Spring Boot Starters**
   - Use Spring Boot starters for quick project setup
   - Include only necessary dependencies
   - Leverage auto-configuration features effectively

3. **Annotations Usage**
   - Use `@SpringBootApplication` for main application class
   - Use `@RestController` for REST API controllers
   - Use `@Service` for business logic services
   - Use `@Repository` for data access components
   - Use `@Component` for general Spring beans

### RESTful API Design

1. **Controller Implementation**
   ```java
   @RestController
   @RequestMapping("/api/v1/users")
   @Validated
   public class UserController {
       
       private final UserService userService;
       
       public UserController(UserService userService) {
           this.userService = userService;
       }
       
       @GetMapping("/{id}")
       public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
           UserDto user = userService.findById(id);
           return ResponseEntity.ok(user);
       }
       
       @PostMapping
       public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
           UserDto user = userService.createUser(request);
           return ResponseEntity.status(HttpStatus.CREATED).body(user);
       }
   }
   ```

2. **HTTP Methods and Status Codes**
   - Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
   - Return proper HTTP status codes
   - Implement proper error handling with meaningful responses

## Naming Conventions

### Class and Interface Names

1. **Class Naming**
   - Use PascalCase for class names
   - Examples: `UserController`, `OrderService`, `UserRepository`
   - Use descriptive names that indicate purpose and responsibility

2. **Interface Naming**
   - Use PascalCase for interface names
   - Examples: `UserService`, `OrderRepository`
   - Avoid prefixing with "I" (e.g., use `UserService` not `IUserService`)

### Method and Variable Names

1. **Method Naming**
   - Use camelCase for method names
   - Use descriptive verbs that indicate action
   - Examples: `findUserById`, `createOrder`, `validateUserInput`

2. **Variable Naming**
   - Use camelCase for variable names
   - Use descriptive names that indicate purpose
   - Examples: `userRepository`, `orderService`, `isValid`

3. **Constants**
   - Use ALL_CAPS for constants
   - Use underscores to separate words
   - Examples: `MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE`

## Dependency Injection and IoC

### Constructor Injection

1. **Preferred Approach**
   ```java
   @Service
   public class UserService {
       
       private final UserRepository userRepository;
       private final EmailService emailService;
       
       public UserService(UserRepository userRepository, EmailService emailService) {
           this.userRepository = userRepository;
           this.emailService = emailService;
       }
   }
   ```

2. **Benefits**
   - Better testability through dependency injection
   - Immutable dependencies
   - Clear dependency requirements
   - Compile-time validation of dependencies

### Bean Configuration

1. **Configuration Classes**
   ```java
   @Configuration
   public class AppConfig {
       
       @Bean
       public ObjectMapper objectMapper() {
           ObjectMapper mapper = new ObjectMapper();
           mapper.registerModule(new JavaTimeModule());
           return mapper;
       }
   }
   ```

## Data Access and ORM

### Spring Data JPA

1. **Entity Classes**
   ```java
   @Entity
   @Table(name = "users")
   public class User {
       
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @Column(nullable = false, unique = true)
       private String email;
       
       @Column(nullable = false)
       private String name;
       
       // Constructors, getters, setters
   }
   ```

2. **Repository Interfaces**
   ```java
   @Repository
   public interface UserRepository extends JpaRepository<User, Long> {
       
       Optional<User> findByEmail(String email);
       
       List<User> findByActiveTrue();
       
       @Query("SELECT u FROM User u WHERE u.createdDate >= :startDate")
       List<User> findUsersCreatedAfter(@Param("startDate") LocalDateTime startDate);
   }
   ```

3. **Database Migrations**
   - Use Flyway or Liquibase for database migrations
   - Version control database schema changes
   - Implement proper rollback strategies

## Validation and Error Handling

### Bean Validation

1. **Request Validation**
   ```java
   public class CreateUserRequest {
       
       @NotBlank(message = "Email is required")
       @Email(message = "Invalid email format")
       private String email;
       
       @NotBlank(message = "Name is required")
       @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
       private String name;
       
       // Getters and setters
   }
   ```

2. **Custom Validators**
   ```java
   @Constraint(validatedBy = UniqueEmailValidator.class)
   @Target({ElementType.FIELD})
   @Retention(RetentionPolicy.RUNTIME)
   public @interface UniqueEmail {
       String message() default "Email already exists";
       Class<?>[] groups() default {};
       Class<? extends Payload>[] payload() default {};
   }
   ```

### Exception Handling

1. **Global Exception Handler**
   ```java
   @ControllerAdvice
   public class GlobalExceptionHandler {
       
       @ExceptionHandler(EntityNotFoundException.class)
       public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
           ErrorResponse error = new ErrorResponse("NOT_FOUND", ex.getMessage());
           return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
       }
       
       @ExceptionHandler(MethodArgumentNotValidException.class)
       public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
           List<String> errors = ex.getBindingResult()
               .getFieldErrors()
               .stream()
               .map(FieldError::getDefaultMessage)
               .collect(Collectors.toList());
           
           ErrorResponse error = new ErrorResponse("VALIDATION_ERROR", "Validation failed", errors);
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
       }
   }
   ```

## Testing

### Unit Testing

1. **Service Layer Testing**
   ```java
   @ExtendWith(MockitoExtension.class)
   class UserServiceTest {
       
       @Mock
       private UserRepository userRepository;
       
       @InjectMocks
       private UserService userService;
       
       @Test
       void shouldCreateUserSuccessfully() {
           // Given
           CreateUserRequest request = new CreateUserRequest("test@example.com", "Test User");
           User savedUser = new User(1L, "test@example.com", "Test User");
           
           when(userRepository.save(any(User.class))).thenReturn(savedUser);
           
           // When
           UserDto result = userService.createUser(request);
           
           // Then
           assertThat(result.getEmail()).isEqualTo("test@example.com");
           verify(userRepository).save(any(User.class));
       }
   }
   ```

2. **Controller Testing**
   ```java
   @WebMvcTest(UserController.class)
   class UserControllerTest {
       
       @Autowired
       private MockMvc mockMvc;
       
       @MockBean
       private UserService userService;
       
       @Test
       void shouldReturnUserWhenValidId() throws Exception {
           // Given
           UserDto user = new UserDto(1L, "test@example.com", "Test User");
           when(userService.findById(1L)).thenReturn(user);
           
           // When & Then
           mockMvc.perform(get("/api/v1/users/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.email").value("test@example.com"));
       }
   }
   ```

### Integration Testing

1. **Repository Testing**
   ```java
   @DataJpaTest
   class UserRepositoryTest {
       
       @Autowired
       private UserRepository userRepository;
       
       @Test
       void shouldFindUserByEmail() {
           // Given
           User user = new User(null, "test@example.com", "Test User");
           userRepository.save(user);
           
           // When
           Optional<User> found = userRepository.findByEmail("test@example.com");
           
           // Then
           assertThat(found).isPresent();
           assertThat(found.get().getName()).isEqualTo("Test User");
       }
   }
   ```

2. **Full Application Testing**
   ```java
   @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
   @AutoConfigureTestDatabase
   class UserControllerIntegrationTest {
       
       @Autowired
       private TestRestTemplate restTemplate;
       
       @Test
       void shouldCreateAndRetrieveUser() {
           // Given
           CreateUserRequest request = new CreateUserRequest("test@example.com", "Test User");
           
           // When
           ResponseEntity<UserDto> createResponse = restTemplate.postForEntity(
               "/api/v1/users", request, UserDto.class);
           
           // Then
           assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
           
           // When
           ResponseEntity<UserDto> getResponse = restTemplate.getForEntity(
               "/api/v1/users/" + createResponse.getBody().getId(), UserDto.class);
           
           // Then
           assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
           assertThat(getResponse.getBody().getEmail()).isEqualTo("test@example.com");
       }
   }
   ```

## Configuration and Properties

### Application Properties

1. **Configuration Files**
   ```yaml
   # application.yml
   spring:
     application:
       name: user-service
     datasource:
       url: jdbc:postgresql://localhost:5432/users
       username: ${DB_USERNAME}
       password: ${DB_PASSWORD}
     jpa:
       hibernate:
         ddl-auto: validate
       show-sql: false
     profiles:
       active: dev
   
   server:
     port: 8080
   
   logging:
     level:
       com.company.project: DEBUG
       org.springframework.web: INFO
   ```

2. **Environment-Specific Configuration**
   ```yaml
   # application-dev.yml
   spring:
     datasource:
       url: jdbc:h2:mem:testdb
     jpa:
       show-sql: true
   
   logging:
     level:
       com.company.project: DEBUG
   ```

3. **Type-Safe Configuration**
   ```java
   @ConfigurationProperties(prefix = "app")
   @Validated
   public class AppProperties {
       
       @NotBlank
       private String apiKey;
       
       @Min(1)
       @Max(100)
       private int maxRetries = 3;
       
       // Getters and setters
   }
   ```

## Security

### Spring Security Implementation

1. **Security Configuration**
   ```java
   @Configuration
   @EnableWebSecurity
   public class SecurityConfig {
       
       @Bean
       public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
           http
               .authorizeHttpRequests(authz -> authz
                   .requestMatchers("/api/public/**").permitAll()
                   .requestMatchers("/api/admin/**").hasRole("ADMIN")
                   .anyRequest().authenticated()
               )
               .csrf(csrf -> csrf.disable())
               .sessionManagement(session -> session
                   .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
               );
           
           return http.build();
       }
       
       @Bean
       public PasswordEncoder passwordEncoder() {
           return new BCryptPasswordEncoder();
       }
   }
   ```

2. **JWT Authentication**
   ```java
   @Component
   public class JwtAuthenticationFilter extends OncePerRequestFilter {
       
       @Override
       protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
           // JWT token validation logic
       }
   }
   ```

## Performance and Scalability

### Caching Strategies

1. **Spring Cache Implementation**
   ```java
   @Service
   @CacheConfig(cacheNames = "users")
   public class UserService {
       
       @Cacheable(key = "#id")
       public UserDto findById(Long id) {
           // Implementation
       }
       
       @CacheEvict(key = "#user.id")
       public UserDto updateUser(UserDto user) {
           // Implementation
       }
   }
   ```

2. **Async Processing**
   ```java
   @Configuration
   @EnableAsync
   public class AsyncConfig {
       
       @Bean
       public Executor taskExecutor() {
           ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
           executor.setCorePoolSize(5);
           executor.setMaxPoolSize(10);
           executor.setQueueCapacity(25);
           executor.setThreadNamePrefix("Async-");
           executor.initialize();
           return executor;
       }
   }
   
   @Service
   public class EmailService {
       
       @Async
       public CompletableFuture<Void> sendWelcomeEmail(String email) {
           // Async email sending logic
           return CompletableFuture.completedFuture(null);
       }
   }
   ```

## Logging and Monitoring

### Logging Configuration

1. **SLF4J with Logback**
   ```java
   @Slf4j
   @Service
   public class UserService {
       
       public UserDto createUser(CreateUserRequest request) {
           log.info("Creating user with email: {}", request.getEmail());
           
           try {
               // Implementation
               log.debug("User created successfully with ID: {}", user.getId());
               return userDto;
           } catch (Exception e) {
               log.error("Failed to create user with email: {}", request.getEmail(), e);
               throw e;
           }
       }
   }
   ```

2. **Spring Boot Actuator**
   ```yaml
   # application.yml
   management:
     endpoints:
       web:
         exposure:
           include: health,info,metrics,prometheus
     endpoint:
       health:
         show-details: when-authorized
   ```

## API Documentation

### OpenAPI Documentation

1. **Springdoc OpenAPI Configuration**
   ```java
   @Configuration
   public class OpenApiConfig {
       
       @Bean
       public OpenAPI customOpenAPI() {
           return new OpenAPI()
               .info(new Info()
                   .title("User Service API")
                   .version("1.0")
                   .description("API for managing users")
                   .contact(new Contact()
                       .name("Development Team")
                       .email("dev@company.com")));
       }
   }
   ```

2. **Controller Documentation**
   ```java
   @RestController
   @RequestMapping("/api/v1/users")
   @Tag(name = "User Management", description = "APIs for managing users")
   public class UserController {
       
       @Operation(summary = "Get user by ID", description = "Retrieves a user by their unique identifier")
       @ApiResponses(value = {
           @ApiResponse(responseCode = "200", description = "User found"),
           @ApiResponse(responseCode = "404", description = "User not found")
       })
       @GetMapping("/{id}")
       public ResponseEntity<UserDto> getUserById(@Parameter(description = "User ID") @PathVariable Long id) {
           // Implementation
       }
   }
   ```

## Build and Deployment

### Maven Configuration

1. **pom.xml Structure**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0">
       <modelVersion>4.0.0</modelVersion>
       
       <parent>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-parent</artifactId>
           <version>3.2.0</version>
       </parent>
       
       <groupId>com.company</groupId>
       <artifactId>user-service</artifactId>
       <version>1.0.0</version>
       
       <properties>
           <java.version>17</java.version>
       </properties>
       
       <dependencies>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-web</artifactId>
           </dependency>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-data-jpa</artifactId>
           </dependency>
           <!-- Additional dependencies -->
       </dependencies>
       
       <profiles>
           <profile>
               <id>dev</id>
               <properties>
                   <spring.profiles.active>dev</spring.profiles.active>
               </properties>
           </profile>
           <profile>
               <id>prod</id>
               <properties>
                   <spring.profiles.active>prod</spring.profiles.active>
               </properties>
           </profile>
       </profiles>
   </project>
   ```

2. **Docker Configuration**
   ```dockerfile
   FROM openjdk:17-jdk-slim
   
   WORKDIR /app
   
   COPY target/*.jar app.jar
   
   EXPOSE 8080
   
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

## Best Practices

### Code Quality

1. **SOLID Principles**
   - Single Responsibility Principle: Each class has one reason to change
   - Open/Closed Principle: Open for extension, closed for modification
   - Liskov Substitution Principle: Subtypes are substitutable for their base types
   - Interface Segregation Principle: Clients depend only on interfaces they use
   - Dependency Inversion Principle: Depend on abstractions, not concretions

2. **Clean Code Practices**
   - Write self-documenting code with meaningful names
   - Keep methods small and focused
   - Avoid deep nesting and complex conditionals
   - Use early returns to reduce complexity
   - Implement proper error handling

3. **Performance Considerations**
   - Use appropriate data structures and algorithms
   - Implement proper database indexing
   - Use connection pooling for database connections
   - Implement caching strategies where appropriate
   - Monitor application performance with metrics

### Security Best Practices

1. **Input Validation**
   - Validate all user inputs
   - Use parameterized queries to prevent SQL injection
   - Implement proper authentication and authorization
   - Use HTTPS in production environments

2. **Error Handling**
   - Don't expose sensitive information in error messages
   - Log security-related events
   - Implement proper session management
   - Use secure password hashing algorithms

### Testing Best Practices

1. **Test Coverage**
   - Aim for high test coverage (80%+)
   - Test both happy path and edge cases
   - Use meaningful test names that describe the scenario
   - Keep tests independent and isolated

2. **Test Organization**
   - Follow the Arrange-Act-Assert pattern
   - Use descriptive test method names
   - Group related tests in test classes
   - Use test data builders for complex objects

## Examples

### Complete Service Implementation

```java
@Service
@Transactional
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository,
                      EmailService emailService,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Cacheable(key = "#id")
    public UserDto findById(Long id) {
        log.debug("Finding user by ID: {}", id);
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id));
        
        return UserMapper.toDto(user);
    }
    
    @CacheEvict(key = "#result.id")
    public UserDto createUser(CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with email already exists: " + request.getEmail());
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userRepository.save(user);
        
        // Send welcome email asynchronously
        emailService.sendWelcomeEmail(savedUser.getEmail());
        
        log.info("User created successfully with ID: {}", savedUser.getId());
        return UserMapper.toDto(savedUser);
    }
}
```

### Complete Controller Implementation

```java
@RestController
@RequestMapping("/api/v1/users")
@Validated
@Tag(name = "User Management", description = "APIs for managing users")
@Slf4j
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        log.debug("Getting user by ID: {}", id);
        UserDto user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    @Operation(summary = "Create new user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "User created"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "409", description = "User already exists")
    })
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());
        UserDto user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update user")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id,
                                            @Valid @RequestBody UpdateUserRequest request) {
        log.info("Updating user with ID: {}", id);
        UserDto user = userService.updateUser(id, request);
        return ResponseEntity.ok(user);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("Deleting user with ID: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

## References

- [Spring Boot Reference Documentation](md:https:/docs.spring.io/spring-boot/docs/current/reference/html)
- [Spring Framework Documentation](md:https:/docs.spring.io/spring-framework/docs/current/reference/html)
- [Spring Data JPA Reference](md:https:/docs.spring.io/spring-data/jpa/docs/current/reference/html)
- [Spring Security Reference](md:https:/docs.spring.io/spring-security/site/docs/current/reference/html5)
- [JUnit 5 User Guide](md:https:/junit.org/junit5/docs/current/user-guide)
- [Maven Documentation](md:https:/maven.apache.org/guides)
