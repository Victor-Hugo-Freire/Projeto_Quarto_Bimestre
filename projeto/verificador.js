import readline from "readline";
import pkg from "pg";
import fs from "fs";
const { Pool } = pkg;

const path = "../csvs";
// aqui é apenas o objeto da biblioteca node que se comunica com o banco
const pool = new Pool({
  user: "postgres",
  password: "lindo",
  host: "localhost",
  port: 5432,
  database: "teste_dE_depencia_funcional",
});

// aqui é o objeto da biblioteca node que lê entradas do terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// função que pega todas as tabelas do banco
async function pegaTabelas() {
  const client = await pool.connect();
  const consultaTabelas = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE';
  `);
  client.release();

  const tabelas = [];
  for (let i = 0; i < consultaTabelas.rows.length; i++) {
    tabelas.push(consultaTabelas.rows[i].table_name);
  }
  return tabelas;
}
//pega todas as colunas de uma tabela específica
async function pegaColunas(tabela) {
  const client = await pool.connect();
  const verificarCR = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = '${tabela}';
  `);
  client.release();

  const colunas = [];
  for (let i = 0; i < verificarCR.rows.length; i++) {
    colunas.push(verificarCR.rows[i].column_name);
  }
  return colunas;
}

// função que transforma um arquivo CSV em uma tabela no banco
async function transformarCsv(nomeArquivo) {
  let caminhoCompleto = "";
  for (let i = 0; i < path.length; i++) {
    caminhoCompleto += path[i];
  }
  caminhoCompleto += "/" + nomeArquivo;

  const conteudo = fs.readFileSync(caminhoCompleto, "utf8");

  let linhas = [];
  let linha = "";
  for (let i = 0; i < conteudo.length; i++) {
    if (conteudo[i] === "\n") {
      if (linha.trim() !== "") linhas.push(linha.trim());
      linha = "";
    } else {
      linha += conteudo[i];
    }
  }
  if (linha.trim() !== "") linhas.push(linha.trim());

  let colunas = [];
  let coluna = "";
  let primeiraLinha = linhas[0];
  for (let i = 0; i < primeiraLinha.length; i++) {
    if (primeiraLinha[i] === ";") {
      colunas.push(coluna.trim());
      coluna = "";
    } else {
      coluna += primeiraLinha[i];
    }
  }
  if (coluna !== "") colunas.push(coluna.trim());

  let dados = [];
  for (let i = 1; i < linhas.length; i++) {
    let valores = [];
    let valor = "";
    let linhaAtual = linhas[i];
    for (let j = 0; j < linhaAtual.length; j++) {
      if (linhaAtual[j] === ";") {
        valores.push(valor.trim());
        valor = "";
      } else {
        valor += linhaAtual[j];
      }
    }
    if (valor !== "") valores.push(valor.trim());
    if (valores.length > 0) dados.push(valores);
  }

  const nomeTabela = nomeArquivo.split(".")[0].trim().toLowerCase();
  if (nomeTabela === "") {
    console.log("Nome de tabela inválido!");
    return;
  }

  const client = await pool.connect();

  await client.query(`DROP TABLE IF EXISTS ${nomeTabela};`);

  let createSQL = `CREATE TABLE ${nomeTabela} (\n`;
  for (let i = 0; i < colunas.length; i++) {
    createSQL += `"${colunas[i]}" VARCHAR(50)`;
    if (i < colunas.length - 1) createSQL += ",\n";
  }
  createSQL += "\n);";

  console.log(createSQL);
  await client.query(createSQL);

  for (let i = 0; i < dados.length; i++) {
    const linhaDados = dados[i];
    let insertSQL = `INSERT INTO ${nomeTabela} VALUES (`;
    for (let j = 0; j < linhaDados.length; j++) {
      let valorSeguro = linhaDados[j].replace(/'/g, "''");
      insertSQL += `'${valorSeguro}'`;
      if (j < linhaDados.length - 1) insertSQL += ",";
    }
    insertSQL += ");";
    console.log(insertSQL);
    await client.query(insertSQL);
  }

  client.release();
  console.log(`Tabela '${nomeTabela}' criada e dados inseridos com sucesso!\n`);
  menu();
}

//aqui começa o menu interativo onde a pessoa escolhe o que fazer por numeros e os numeros sejam gerado intuitivamente
async function menu() {
  const tabelas = await pegaTabelas();
  const client = await pool.connect();

  function mostraMenu() {
    console.log(
      "\nInsira o número da tabela que deseja verificar, insira uma nova tabela ou saia:"
    );
    for (let i = 0; i < tabelas.length; i++) {
      console.log(`${i + 1} - ${tabelas[i]}`);
    }

    let inserir = tabelas.length + 1;
    let sair = tabelas.length + 2;
    console.log(`${inserir} - Inserir tabela no banco`);
    console.log(`${sair} - Sair`);

    rl.question("Escolha uma opção: ", async (opcao) => {
      const num = parseInt(opcao);

      if (num === sair) {
        console.log("Saindo...");
        rl.close();
        client.release();
        await pool.end();
        return;
      } else if (num === inserir) {
        fs.readdir(path, async function (err, arquivos) {
          if (err) {
            console.log("Erro ao ler a pasta:", err);
            return;
          }

          console.log("\nArquivos encontrados na pasta csvs:");
          for (let i = 0; i < arquivos.length; i++) {
            console.log(i + 1 + " - " + arquivos[i]);
          }

          rl.question(
            "Escolha o número do arquivo CSV: ",
            async function (opcao) {
              const indice = parseInt(opcao);
              if (indice > 0 && indice <= arquivos.length) {
                const nomeArquivo = arquivos[indice - 1];
                await transformarCsv(nomeArquivo);
              } else {
                console.log("Número inválido!");
                menu();
              }
            }
          );
        });
      } else if (num >= 1 Skip to content
Navigation Menu
gabrielgomesortiz
Projeto_Quarto_Bimestre

Type / to search
Code
Issues
Pull requests
1
Actions
Projects
Security
Insights
É molodoy ou n é? #5
Resolving conflicts between diekred:main and gabrielgomesortiz:main and committing changes  diekred:main
1 conflicting file
verificador.js
projeto/verificador.js
projeto/verificador.js2 conflicts 
  
168
        rl.close();
169
        client.release();
170
        await pool.end();
171
        return;
172
      } else if (num === inserir) {
173
        fs.readdir(path, async function (err, arquivos) {
174
          if (err) {
175
            console.log("Erro ao ler a pasta:", err);
176
            return;
177
          }
178
​
179
          console.log("\nArquivos encontrados na pasta csvs:");
180
          for (let i = 0; i < arquivos.length; i++) {
181
            console.log(i + 1 + " - " + arquivos[i]);
182
          }
183
​
184
          rl.question(
185
            "Escolha o número do arquivo CSV: ",
186
            async function (opcao) {
187
              const indice = parseInt(opcao);
188
              if (indice > 0 && indice <= arquivos.length) {
189
                const nomeArquivo = arquivos[indice - 1];
190
                await transformarCsv(nomeArquivo);
191
              } else {
192
                console.log("Número inválido!");
193
                menu();
194
              }
195
            }
196
          );
197
        });
198
      } else if (num >= 1 && num <= tabelas.length) {
199
        const tabelaEscolhida = tabelas[num - 1];
200
        const colunas = await pegaColunas(tabelaEscolhida);
 |  | 
201
 
202
 
        console.log(`\nColunas da tabela ${tabelaEscolhida}: ${colunas.join(", ")}`);
203
 
        // descobrir tempo de execução
204
 
        let inicio = Date.now();
205
 
        let dependenciasValidas = await verificaDependenciasComMensagem(tabelaEscolhida);
206
 
217
        let fim = Date.now();
218
        console.log(`Tempo de execução da verificação: ${(fim - inicio) / 1000} segundos`);
219
        //
220
        rl.question(
221
          "deseja retirar as colunas redundantes? (sim/não): ",
222
          async function (opcao) {
223
            if (opcao.toLowerCase() === "sim") {
224
              //
225
              let inicio = Date.now();
226
              await retirarRedundancia(dependenciasValidas);
227
              let fim = Date.now();
228
              console.log(`Tempo de execução da verificação: ${(fim - inicio) / 1000} segundos`);
229
              //
Resolve Conflicts · Pull Request #5 · gabrielgomesortiz/Projeto_Quarto_Bimestre&& num <= tabelas.length) {
        const tabelaEscolhida = tabelas[num - 1];
        const colunas = await pegaColunas(tabelaEscolhida);
        console.log(`\nColunas da tabela ${tabelaEscolhida}: ${colunas.join(", ")}`);
        // descobrir tempo de execução
        let inicio = Date.now();
        let dependenciasValidas = await verificaDependenciasComMensagem(tabelaEscolhida);
        let fim = Date.now();
        console.log(`Tempo de execução da verificação: ${(fim - inicio) / 1000} segundos`);
        //
        rl.question(
          "deseja retirar as colunas redundantes? (sim/não): ",
          async function (opcao) {
            if (opcao.toLowerCase() === "sim") {
              //
              let inicio = Date.now();
              await retirarRedundancia(dependenciasValidas);
              let fim = Date.now();
              console.log(`Tempo de execução da verificação: ${(fim - inicio) / 1000} segundos`);
              //
            } else {
              menu();
            }
          }
        );

        // 🔹 diferença 2: perguntar se deseja retirar redundâncias
        rl.question(
          "Deseja retirar as colunas redundantes? (sim/não): ",
          async function (opcao) {
            if (opcao.toLowerCase() === "sim") {
              let inicio = Date.now();
              await retirarRedundancia(dependenciasValidas);
              let fim = Date.now();
              console.log(
                `Tempo de execução da remoção: ${(fim - inicio) / 1000} segundos`
              );
            } else {
              menu();
            }
          }
        );
      } else {
        console.log("Opção inválida!");
        mostraMenu();
      }
    });
  }

  mostraMenu();
}

// função que gera todas as combinações de 1 a 3 colunas para o lado esquerdo
// Função externa para gerar combinações de 1 a 3 colunas
function geraCombinacoes(colunas) {
  let combinacoes = [];
  // 1 coluna
  for (let i = 0; i < colunas.length; i++) {
    combinacoes.push([colunas[i]]);
  }
  // 2 colunas
  for (let i = 0; i < colunas.length; i++) {
    for (let j = i + 1; j < colunas.length; j++) {
      combinacoes.push([colunas[i], colunas[j]]);
    }
  }
  // 3 colunas
  for (let i = 0; i < colunas.length; i++) {
    for (let j = i + 1; j < colunas.length; j++) {
      for (let k = j + 1; k < colunas.length; k++) {
        combinacoes.push([colunas[i], colunas[j], colunas[k]]);
      }
    }
  }
  return combinacoes;
}

// Função principal para verificar dependências funcionais só tem um porem é que ele mostra dados redundantes.
async function verificaDependenciasComMensagem(tabela) {
  const colunasTabela = await pegaColunas(tabela);
  const client = await pool.connect();
  const dependenciasValidas = [];

  const colunas = colunasTabela;
  const combinacoes = geraCombinacoes(colunas);

  // testa todas as combinações possíveis de colunas para dependências
  for (let i = 0; i < combinacoes.length; i++) {
    const ladoEsquerdo = combinacoes[i];

    for (let j = 0; j < colunas.length; j++) {
      const ladoDireito = colunas[j];

      // não faz sentido testar A → A ou {A,B} → A se A já está no lado esquerdo
      if (ladoEsquerdo.includes(ladoDireito)) continue;

      let condicaoNaoNula = "";
      for (let i = 0; i < ladoEsquerdo.length; i++) {
        if (i > 0) condicaoNaoNula += " AND ";
        condicaoNaoNula += `"${ladoEsquerdo[i]}" IS NOT NULL`;
      }
      condicaoNaoNula += ` AND "${ladoDireito}" IS NOT NULL`;

      let colunasSelect = "";
      for (let i = 0; i < ladoEsquerdo.length; i++) {
        if (i > 0) colunasSelect += ", ";
        colunasSelect += `"${ladoEsquerdo[i]}"`;
      }

      let query = `
                  SELECT ${colunasSelect}, COUNT(DISTINCT "${ladoDireito}") AS contagem
                  FROM "${tabela}"
                  WHERE ${condicaoNaoNula}
                  GROUP BY ${colunasSelect}
                  HAVING COUNT(DISTINCT "${ladoDireito}") > 1;`;

      const resultadoQuery = await client.query(query);

      // se não existir grupo com mais de um valor distinto, a dependência é válida
      if (resultadoQuery.rows.length === 0) {
        dependenciasValidas.push({
          esquerda: ladoEsquerdo,
          direita: ladoDireito,
        });
      }
    }
  }

  client.release();

  for (let i = 0; i < dependenciasValidas.length; i++) {
    const dep = dependenciasValidas[i];
    console.log(dep.esquerda.join(", ") + " -> " + dep.direita);
  }

  console.log(
    "Total: " + dependenciasValidas.length + " dependências válidas" + "\n"
  );
  return dependenciasValidas;
}


async function retirarRedundancia(dependenciasValidas) {
  function copiaDependencias(deps) {
    let c = [];
    for (let i = 0; i < deps.length; i++) {
      let item = { esquerda: [], direita: deps[i].direita };
      for (let j = 0; j < deps[i].esquerda.length; j++) {
        item.esquerda.push(deps[i].esquerda[j]);
      }
      c.push(item);
    }
    return c;
  }

  function fechamentoAtributos(conjunto, dependencias) {
    let fechamento = [];
    for (let i = 0; i < conjunto.length; i++) {
      fechamento.push(conjunto[i]);
    }

    let alterou = true;
    while (alterou) {
      alterou = false;
      for (let i = 0; i < dependencias.length; i++) {
        let dep = dependencias[i];
        let contemTodos = true;
        for (let j = 0; j < dep.esquerda.length; j++) {
          let achou = false;
          for (let k = 0; k < fechamento.length; k++) {
            if (dep.esquerda[j] === fechamento[k]) {
              achou = true;
            }
          }
          if (!achou) {
            contemTodos = false;
          }
        }
        if (contemTodos) {
          let existe = false;
          for (let k = 0; k < fechamento.length; k++) {
            if (fechamento[k] === dep.direita) {
              existe = true;
            }
          }
          if (!existe) {
            fechamento.push(dep.direita);
            alterou = true;
          }
        }
      }
    }
    return fechamento;
  }

  let F = copiaDependencias(dependenciasValidas);

  let naoTriviais = [];
  for (let i = 0; i < F.length; i++) {
    let dep = F[i];
    let trivial = false;
    for (let j = 0; j < dep.esquerda.length; j++) {
      if (dep.esquerda[j] === dep.direita) {
        trivial = true;
      }
    }
    if (!trivial) {
      naoTriviais.push(dep);
    }
  }
  F = naoTriviais;

  for (let i = 0; i < F.length; i++) {
    let dep = F[i];
    let reduziuAlgo = true;
    while (reduziuAlgo) {
      reduziuAlgo = false;
      for (let a = 0; a < dep.esquerda.length; a++) {
        if (dep.esquerda.length <= 1) break;
        let candidato = [];
        for (let x = 0; x < dep.esquerda.length; x++) {
          if (x !== a) candidato.push(dep.esquerda[x]);
        }
        let outras = [];
        for (let j = 0; j < F.length; j++) {
          if (j !== i) {
            outras.push(F[j]);
          } else {
            outras.push({ esquerda: candidato, direita: dep.direita });
          }
        }
        let fechamento = fechamentoAtributos(candidato, outras);
        let contem = false;
        for (let k = 0; k < fechamento.length; k++) {
          if (fechamento[k] === dep.direita) {
            contem = true;
            break;
          }
        }
        if (contem) {
          let novaEsquerda = [];
          for (let y = 0; y < dep.esquerda.length; y++) {
            if (y !== a) novaEsquerda.push(dep.esquerda[y]);
          }
          dep.esquerda = novaEsquerda;
          reduziuAlgo = true;
          a = -1;
        }
      }
    }
  }

  let mudou = true;
  while (mudou) {
    mudou = false;
    for (let i = 0; i < F.length; i++) {
      let dep = F[i];
      let outras = [];
      for (let j = 0; j < F.length; j++) {
        if (j !== i) outras.push(F[j]);
      }
      let fechamento = fechamentoAtributos(dep.esquerda, outras);
      let contem = false;
      for (let k = 0; k < fechamento.length; k++) {
        if (fechamento[k] === dep.direita) {
          contem = true;
          break;
        }
      }
      if (contem) {
        for (let j = i; j < F.length - 1; j++) {
          F[j] = F[j + 1];
        }
        F.length = F.length - 1;
        i = i - 1;
        mudou = true;
      }
    }
  }

  console.log("\nDependências finais (cobertura canônica simplificada):");
  for (let i = 0; i < F.length; i++) {
    let dep = F[i];
    let esquerdaTexto = "";
    for (let j = 0; j < dep.esquerda.length; j++) {
      esquerdaTexto += dep.esquerda[j];
      if (j < dep.esquerda.length - 1) esquerdaTexto += ", ";
    }
    console.log(esquerdaTexto + " -> " + dep.direita);
  }
  console.log("Total: " + F.length + " dependências finais.\n");

  menu();
}
menu();