# AGENTS.md — MoneyTracker Project Rules

## 🧠 Response Format & Behavior Rules

### Thinking Before Answer
- Before every response, **first** write a concise reasoning block starting with `► **THINKING**`.
- In this block, analyze:
  - The core intent of the user’s request.
  - Which files/modules are affected.
  - Any potential risks or conflicts with existing architecture.
- Keep it short and focused — no fluff.

### Answer
- Provide the implementation, code, or guidance requested.
- Be direct, use examples where appropriate, and follow the technical rules below.

### Mini-Summary After Answer
- After the main answer, add a `► **SUMMARY**` block (2–4 sentences).
- Recap what was done or proposed and why.

### Focus & Discipline
- **Focus strictly on the latest user message.** Do not browse unrelated files or past context unless explicitly asked.
- **No autonomous actions.** Do not edit, create, or delete files unless the user has requested it. If you see a potential improvement, mention it explicitly rather than acting on it.
- **No side-looking.** If the user asks a general question, give a general answer — do not dive into the codebase to find extra problems.
- **Important general notes** belong in the answer or summary, not in extended tangents.

## 🧱 TypeScript (General)
- **Strict mode**: All files use `strict: true`. Avoid `any` — allowed only in tests or third-party adapter layers.
- **Types first**: Public functions and classes must have explicit argument and return types. Prefer `interface` for objects, `type` for unions/intersections.
- **Naming**:
  - Variables, functions, methods: `camelCase`.
  - Classes, components, interfaces: `PascalCase`.
  - Booleans: prefixed with `is`, `has`, or `should` (e.g., `isLoading`, `hasError`).
- **Null handling**: Use `undefined` instead of `null` except when dealing with database fields where Prisma returns `null`.
- **Async**: Always `async/await`, no `.then()` chains. Wrap in `try/catch` with custom error types.
- **Error handling**: Throw custom error classes extending `Error` with a `code` field. In NestJS, use standard `HttpException` or derived classes.

## 🏗️ NestJS
- **Module structure**: `src/modules/<name>/` containing `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, `dto/`, `entities/` (if needed).
- **Controllers**: Only routing and validation. Business logic lives in services. Decorate with `@ApiTags`, `@ApiOperation` for Swagger docs.
- **Services**: Always `@Injectable()`. Dependency injection via constructor. Never manually instantiate services.
- **Validation**: DTOs use `class-validator` decorators. Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`.
- **Error responses**: Controllers throw `HttpException` or custom exceptions. A global filter ensures uniform `{ success: boolean, data?: any, error?: string }` responses.
- **Configuration**: Use `@nestjs/config` and `ConfigService`. Never access `process.env` directly in services.
- **Logging**: Use NestJS's built-in `Logger` with context (service name). No `console.log`.
- **Testing**: Unit tests for services with mocked dependencies. E2E tests for critical endpoints using `supertest`.

## 🗄️ Prisma
- **Schema**: All schema changes via migrations: `npx prisma migrate dev --name <name>`. Never edit the database manually.
- **Client**: A single `PrismaClient` instance provided by `@nestjs/prisma`. Don't create new clients in services.
- **Queries**: Use `select` for reading (not `include`) to fetch only necessary fields. Use `include` only when related data is essential.
- **Transactions**: For atomic operations, use `prisma.$transaction([...])`.
- **Error handling**: Catch `PrismaClientKnownRequestError` (e.g., `P2002` for unique constraint) and convert to HTTP exceptions.
- **Timezones**: All dates stored in UTC. Accept ISO strings in DTOs, transform to `Date` via `class-transformer`.
- **CI/CD**: Check migrations don't drop data. Use `--create-only` for risky operations.

## 🔴 Redis
- **Purpose**: Caching, queues, temporary locks. Not a permanent data store.
- **Client**: `ioredis` (recommended). Connect via `@nestjs/bull` for queues or a direct `RedisModule`.
- **Key naming**: Colon-separated namespaces: `cache:user:123`, `lock:email:abc@example.com`. Always set a TTL (`EXPIRE`).
- **Serialization**: `JSON.stringify`/`JSON.parse`. For large objects, compress before storing (gzip).
- **Error handling**: Redis may be unavailable. Wrap all cache operations in `try/catch` and degrade gracefully (fallback to database). Never crash the main flow.
- **Locks**: Use `SET key value NX EX 10` for simple locks. Release only after checking ownership (Lua script).
- **Env vars**: `REDIS_URL` with full connection string (including password). No hardcoding.

## 🤖 DeepSeek API
- **Configuration**:
  - `DEEPSEEK_API_KEY` in `.env` (never commit).
  - `DEEPSEEK_API_URL` (default `https://api.deepseek.com/v1`).
  - Models: `deepseek-chat` for text, `deepseek-reasoner` for analysis.
- **Invocation**: Only from backend (NestJS service). Never call directly from React Native.
- **Prompts**: Stored in constants or `prompts/` files. Always include a `system` prompt specifying the role and expected JSON format.
- **Response validation**: Request strict JSON. Validate with a Zod schema or `class-validator` before use.
- **Error handling**:
  - Request timeout: 30 seconds.
  - Network errors: 2 retries with exponential backoff.
  - Invalid JSON in response: log raw response, return a generic error message to the user.
- **Token economy**: Keep prompts minimal. Cache reused prompts. Don't send large contexts unnecessarily.
- **Security**: Never log API keys. Don't include sensitive data in prompts.

## 📱 React Native
- **Structure**:
  - `src/screens/` — full-screen views.
  - `src/components/` — reusable UI components.
  - `src/api/` — API client layer (axios/fetch).
  - `src/hooks/` — custom hooks.
  - `src/types/` — shared types.
- **Styling**: Use `StyleSheet.create`. Minimal inline styles (only dynamic values).
- **Navigation**: React Navigation v6+. Type-safe routes via `NativeStackScreenProps`.
- **State management**: Zustand or React Context for global state. React Query (TanStack Query) for server data.
- **Platform code**: Separate via `Platform.OS` or `.ios.ts`/`.android.ts` files.
- **Camera**: Use `react-native-image-picker` or `expo-camera`. Always request permissions and handle denial.
- **Speech**: Use `expo-speech` or `react-native-voice`. Check device availability.
- **Error handling**: Global API error handler showing Toast/Snackbar. `ErrorBoundary` for critical crashes.
- **Security**: Store auth tokens in `expo-secure-store` or `react-native-keychain`.
- **Testing**: Jest + React Native Testing Library. Smoke tests for main screens.