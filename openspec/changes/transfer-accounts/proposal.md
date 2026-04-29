# Proposal: Transfer Between Accounts

## Summary
Реализация переводов между счетами пользователя (TransactionType.TRANSFER). Создание транзакции-перевода уменьшает баланс источника и увеличивает баланс получателя. Поддержка разных валют с конвертацией.

## Motivation
Пользователи часто переводят деньги между своими счетами (наличные → банк, банк → кредитка). Сейчас это невозможно сделать корректно.

## Non-goals
- Не поддерживаем переводы другим пользователям (это Family module)
- Не добавляем комиссии на перевод (считаем 1:1 или по курсу)

## Affected Specs
- `specs/transactions/spec.md` (TRANSFER type requirements)
- `specs/accounts/spec.md` (balance update rules)

## Spec Delta
Добавлено в `specs/transactions/spec.md`:
- Requirement: Transfer between user accounts
- Scenario: Create transfer with same currency
- Scenario: Create transfer with currency conversion
- Scenario: Prevent transfer to same account
