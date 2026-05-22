# Tasks: Transfer Between Accounts

## Phase 1: Backend
- [ ] Расширить `TransactionService.create()` — поддержка type=TRANSFER
- [ ] Валидация: sourceAccountId и targetAccountId должны принадлежать пользователю
- [ ] Валидация: sourceAccountId !== targetAccountId
- [ ] Баланс: списать с source, зачислить на target
- [ ] Конвертация валют при разных currency (через ExchangeRate)
- [ ] `GET /transactions` — фильтр по type=TRANSFER
- [ ] `DELETE /transactions/:id` — rollback для transfer (восстановить оба баланса)

## Phase 2: Mobile UI
- [ ] В AddTransactionModal добавить тип «Перевод»
- [ ] При выборе TRANSFER — показать два поля счёта (from / to)
- [ ] Показывать exchange rate если валюты разные
- [ ] Отдельный стиль для transfer items в списке транзакций

## Phase 3: Testing
- [ ] Unit tests для transfer logic
- [ ] E2E: create transfer, verify balances, delete transfer
- [ ] Edge case: insufficient funds, same account, currency conversion
