# Gamedev Job Interview Task

## Тестовое задание

### Задача

Есть множество (массив, где порядок не важен) целых чисел (от 1 до 1000). Количество чисел - до 200. Необходимо написать функцию сериализации/десериализации в строку. Цель задачи - сделать строчку максимально короткой.

### Решение

Число сериализируется последовательностью из одного или двух символов [d1]d0, где d1: 0..27 ('a'..'z', '-', '+'), d2: 0..35 ('A'..'Z', '0'..'9'). Максимальное значение целого d1*d0 - 1 = 28*36 - 1 = 1007. Таблицы кодировки d1 и d0 не пересекающиеся, поэтому при сериализации последовательности целых чисел отсутствует необходимость в символе-разделителе.
