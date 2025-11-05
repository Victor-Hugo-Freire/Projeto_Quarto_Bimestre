-- Se a consulta não retornar nada, a dependência é válida.
-- Consultas para verificar dependências funcionais em 'aluno'
SELECT ra, COUNT(DISTINCT nome) AS cnt 
FROM aluno 
GROUP BY ra 
HAVING COUNT(DISTINCT nome) > 1;

SELECT ra, COUNT(DISTINCT curso) AS cnt 
FROM aluno 
GROUP BY ra 
HAVING COUNT(DISTINCT curso) > 1;

SELECT ra, COUNT(DISTINCT periodo) AS cnt 
FROM aluno 
GROUP BY ra 
HAVING COUNT(DISTINCT periodo) > 1;

SELECT curso, COUNT(DISTINCT periodo) AS cnt 
FROM aluno 
GROUP BY curso 
HAVING COUNT(DISTINCT periodo) > 1;

SELECT nome, COUNT(DISTINCT ra) AS cnt 
FROM aluno 
GROUP BY nome 
HAVING COUNT(DISTINCT ra) > 1;

SELECT periodo, COUNT(DISTINCT curso) AS cnt 
FROM aluno 
GROUP BY periodo 
HAVING COUNT(DISTINCT curso) > 1;

-- Consultas para verificar dependências funcionais em 'funcionario'

SELECT id_func, COUNT(DISTINCT nome) AS cnt 
FROM funcionario 
GROUP BY id_func 
HAVING COUNT(DISTINCT nome) > 1;

SELECT cpf, COUNT(DISTINCT nome) AS cnt 
FROM funcionario 
GROUP BY cpf 
HAVING COUNT(DISTINCT nome) > 1;

SELECT departamento, COUNT(DISTINCT salario) AS cnt 
FROM funcionario 
GROUP BY departamento 
HAVING COUNT(DISTINCT salario) > 1;

SELECT cargo, COUNT(DISTINCT salario) AS cnt 
FROM funcionario 
GROUP BY cargo 
HAVING COUNT(DISTINCT salario) > 1;

SELECT nome, departamento, COUNT(DISTINCT salario) AS cnt 
FROM funcionario 
GROUP BY nome, departamento 
HAVING COUNT(DISTINCT salario) > 1;

SELECT cargo, departamento, COUNT(DISTINCT salario) AS cnt 
FROM funcionario 
GROUP BY cargo, departamento 
HAVING COUNT(DISTINCT salario) > 1;