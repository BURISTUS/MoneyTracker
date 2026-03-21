II. Backend Deep Dive: NestJS Patterns & Workflow
Используемые паттерны (Design Patterns)

    Repository Pattern:

        Сервисы не должны знать, используем мы TypeORM, Prisma или Mongoose. Вся работа с БД инкапсулируется в репозиториях.

    DTO (Data Transfer Object):

        Каждый входной запрос (@Body, @Query, @Param) должен иметь свой класс DTO.

        Используй декораторы class-validator (@IsString, @IsInt, @Min) и class-transformer.

    Adapter/Mapper:

        Никогда не возвращай Entity базы данных (UserEntity) напрямую на клиент (там пароли, хеши, внутренние ID).

        Используй .toResponseDto() методы или отдельные мапперы для преобразования Entity -> DTO.

    Guard & Decorator:

        Авторизация только через Guards.

        Получение юзера из токена — через кастомный декоратор @CurrentUser().

Структура кода (NestJS)
TypeScript

// BAD
@Get()
findAll() { return this.userRepo.find(); }

// GOOD
@Get()
@UseGuards(JwtAuthGuard)
async findAll(@Query() query: GetUsersDto): Promise<UserResponseDto[]> {
  const users = await this.usersService.findAll(query);
  return users.map(UserMapper.toResponse);
}