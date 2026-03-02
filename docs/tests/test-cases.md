# Casos de Teste - Velô Sprint

Este documento contém os casos de teste funcionais para o sistema Velô Sprint (Configurador de Veículo Elétrico), elaborados de acordo com as regras de negócio e módulos especificados (Landing Page, Configurador de Veículo, Checkout/Pedido, Análise de Crédito Automática, Confirmação, Consulta de Pedidos).

---

### CT01 - Acesso e Navegação na Landing Page

#### Objetivo
Garantir que a Landing Page carrega corretamente e permite direcionamento para o configurador.

#### Pré-Condições
- O sistema deve estar no ar e acessível.
- O usuário não precisa estar autenticado (Perfil Cliente).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Acessar a URL base da aplicação (`/`) | A Landing Page é exibida com o título, banner principal e o botão para iniciar a configuração. |
| 2 | Clicar no botão para iniciar a configuração | O usuário é redirecionado para a página do Configurador de Veículo (`/configure`). |

#### Resultados Esperados
- O sistema carrega a Landing Page sem erros e redireciona com sucesso para a página do configurador ao acionar o Call to Action principal.

#### Critérios de Aceitação
- O redirecionamento para `/configure` ocorre rapidamente ao acionar o botão principal.
- Não existem erros no console referentes a navegação.

---

### CT02 - Configuração Básica e Adicionais (Precificação Dinâmica)

#### Objetivo
Validar se o cálculo do preço final do veículo está aplicando os valores corretos baseados nas opções de rodas e opcionais escolhidos.

#### Pré-Condições
- O usuário deve estar na página de Configurador de Veículo (`/configure`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Visualizar o preço base na tela | O preço exibido inicialmente deve ser de R$ 40.000,00. |
| 2 | Selecionar a roda tipo "Sport" ao invés de "Aero" | O preço total deve ser atualizado para R$ 42.000,00 (+ R$ 2.000,00). |
| 3 | Selecionar o opcional "Precision Park" | O preço total deve ser atualizado para R$ 47.500,00 (+ R$ 5.500,00). |
| 4 | Selecionar o opcional "Flux Capacitor" | O preço total deve ser atualizado para R$ 52.500,00 (+ R$ 5.000,00). |
| 5 | Clicar em "Continuar" para avançar ao Pedido | O usuário é direcionado para a página de Checkout (`/order`) mantendo todas as escolhas e o valor total calculado de R$ 52.500,00 visíveis no resumo. |

#### Resultados Esperados
- A precificação dinâmica é atualizada instantaneamente no Configurador e o valor e configurações refletem corretamente no Checkout.

#### Critérios de Aceitação
- Valor base: R$ 40.000,00.
- Rodas Sport somam exatamente R$ 2.000,00 ao total.
- Precision Park soma exatamente R$ 5.500,00 ao total.
- Flux Capacitor soma exatamente R$ 5.000,00 ao total.

---

### CT03 - Validação de Campos Obrigatórios no Checkout

#### Objetivo
Garantir que o sistema não permita o avanço do checkout quando os campos obrigatórios e de aceite legal estão vazios ou em formato inválido.

#### Pré-Condições
- O usuário finalizou a configuração do veículo e está na página de Checkout/Pedido (`/order`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Deixar todos os campos em branco (Nome, Sobrenome, Email, Telefone, CPF e Loja) e não marcar o aceite de Termos | O formulário permanece não preenchido. |
| 2 | Clicar no botão "Confirmar Pedido" | O sistema bloqueia a submissão e exibe mensagens de erro em vermelho abaixo de todos os campos ("Nome deve ter pelo menos 2 caracteres", "Selecine uma loja", "Aceite os termos", etc). |
| 3 | Preencher os campos de contato com formatos inválidos (Ex: E-mail sem @, CPF incompleto) e clicar no botão de submissão | O sistema exibe mensagens curtas de validação de formatação para os referidos campos (Ex: "Email inválido", "CPF inválido"). |

#### Resultados Esperados
- O sistema intercepta erros de validação localmente e destaca os campos com problemas, em momento algum enviando os dados para a API sem validação prévia.

#### Critérios de Aceitação
- Campos nome/sobrenome exigem um mínimo de 2 caracteres.
- E-mail e CPF possuem validação restrita de formato.
- Checkbox de termos é obrigatoriamente exigido como verdadeiro/marcado.

---

### CT04 - Compra à Vista com Sucesso

#### Objetivo
Validar o fluxo completo de um pedido bem-sucedido via pagamento à vista.

#### Pré-Condições
- O usuário está na página de Checkout (`/order`) com o veículo configurado.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Preencher formulário de Dados Pessoais com informações e contato válidos, e selecionar uma "Loja para Retirada" | Os campos não apresentam mensagens de erro. |
| 2 | Na aba "Forma de Pagamento", manter ou selecionar a opção "À Vista" | A interface exibe o valor total da compra sem calcular número de parcelas ou entrada. |
| 3 | Marcar o checkbox "Li e aceito os Termos de Uso e Política de Privacidade" e clicar em "Confirmar Pedido" | O botão exibe estado de carregamento ("Processando...") enquanto salva o pedido no sistema. |
| 4 | O pedido é processado e retorna sucesso | O usuário é redirecionado para a tela de Sucesso (`/success`) informando o número do pedido (`order_number`). |

#### Resultados Esperados
- O pedido é registrado de imediato sem passar pela análise de crédito, e a tela de confirmação do pedido exibe os dados para ser usado em consultas futuras.

#### Critérios de Aceitação
- O pagamento à vista ignora análise de score de crédito.
- Tela de sucesso indica claramente o identificador para rastreio do pedido no campo de busca.

---

### CT05 - Compra Financiada com Análise de Crédito Aprovada (Score > 700)

#### Objetivo
Validar a avaliação do sistema para uma compra parcelada onde o simulador de análise de crédito detecta Score favorável.

#### Pré-Condições
- O CPF utilizado retorna na API backend um Score superior a 700.
- Preenchimento completo e válido dos Dados Pessoais.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Na caixa "Forma de Pagamento", selecionar a opção "Financiamento" | A ui apresenta um campo para preencher "Valor da Entrada" e demonstra tabelas de impacto das parcelas mensais (12x). |
| 2 | Inserir um "Valor da Entrada" equivalente a 0% até 49% do montante total | O sistema calcula automaticamente o saldo financiado (Total - Entrada) submetendo ele à taxa de juros fixa (2% ao mês) para 12 parcelas mensais. |
| 3 | Marcar o aceite dos termos e clicar em "Confirmar Pedido" | O sistema chama a função da API responsável por retornar o Score de Crédito atrelado ao número do CPF do cliente. |
| 4 | O backend inspeciona as regras (Score > 700) e cadastra o pedido | O usuário é contido por um breve processamento, e direcionado à página de sucesso sem problemas. A transação registra o status final do pedido como "APROVADO" e informa os valores da parcela acordada. |

#### Resultados Esperados
- A compra financiada é aceita com base na verificação algorítmica alta do Score e a aplicação de juros compostos deve ser correta no demonstrativo mensal de 12 meses.

#### Critérios de Aceitação
- A aplicação da taxa de juros deve estar correta: *(Valor_Restante / 12) * 1.02*.
- Status salvo do pedido deve ser explicitamente "APROVADO".

---

### CT06 - Compra Financiada com Score Em Análise (Score 501 a 700)

#### Objetivo
Validar o fluxo alternativo onde o score não se classifica entre altíssimo e não pode ser aprovado imediatamente e nem é totalmente recusado, ganhando o status de revisado em segundo plano.

#### Pré-Condições
- CPF utilizado retorna na API backend um Score entre 501 e 700.
- O campo "Valor da Entrada" informado constitui menos de 50% do custo veicular.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Submeter o formulário devidamente configurado (aba Financiamento) através do botão "Confirmar Pedido" | A API executa a consulta pelo score do cliente do CPF fornecido. |
| 2 | As regras detectam que 500 < Score <= 700 e que a entrada < 50% | O sistema registra com sucesso a criação do pedido, mas atribui o status do pedido correspondente à transação como "EM_ANALISE". |
| 3 | Verificar tela de conclusão (`/success`) ou de busca (`/lookup`) | As informações estão preenchidas porém o cartão de aprovação do registro acusa o status correspondente (Em Análise). |

#### Resultados Esperados
- O pedido prossegue contudo o rastreamento final sinaliza o Status de Em Análise no backoffice.

#### Critérios de Aceitação
- Status validado deve ser efetivamente armazenado como "EM_ANALISE".

---

### CT07 - Compra Financiada com Score Reprovado (Score <= 500)

#### Objetivo
Garantir que crédito escasso resulte em reprovação ao não atender as normas de liquidez do sistema caso a entrada do veículo seja mínima.

#### Pré-Condições
- CPF utilizado retorna na API backend um Score igual ou menor a 500.
- O campo "Valor da Entrada" informado constitui menos de 50% do custo veicular.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Clicar em "Confirmar Pedido" enviando as informações completas geradas pelo financiamento com valor inicial baixo | Sistema dispara requisição à base de dados de Score do CPF. |
| 2 | Avaliação condicional identifica o Score <= 500 | A transação de pedido é gerada sob status "REPROVADO" no rastreio da conclusão. |

#### Resultados Esperados
- O pedido recebe instantaneamente a designação restrita ("REPROVADO") por score insuficiente.

#### Critérios de Aceitação
- Pedidos com Score <= 500 com entrada < 50% obrigatoriamente assumem o status de "REPROVADO".

---

### CT08 - Compra Financiada com Regra de Exceção (Entrada Maior que 50%)

#### Objetivo
Validar adequadamente a restrição onde mesmo que o cliente tenha problemas com serasa na análise de Score, uma Entrada acima da metade ignora esse fato e força aprovação.

#### Pré-Condições
- CPF utilizado retorna na API backend um Score crítico (<= 500).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Na caixa "Forma de Pagamento", configurar a seleção para "Financiamento" | O campo extra de entrada é visualizado. |
| 2 | Preencher o campo numérico "Valor da Entrada" com número maior ou igual a metade (Ex: 50% + 1) do valor total | A interface atualiza as parcelas e amortiza o volume financiado. |
| 3 | Clicar em "Confirmar Pedido" enviando as informações contendo o CPF de score negado | A api contorna a regra principal (Score <= 500) priorizando a primeira condição lógica da cascata `(Entrada / Valor Total) >= 0.5`. |
| 4 | Aguardar desdobramento logístico da tela | A transação registra o status de pedido como "APROVADO" mesmo sem o Score desejado anterior. E direciona à página com a sinalização positiva (`/success`). |

#### Resultados Esperados
- O pedido deve resultar em APROVAÇÃO se a entrada pagar com clareza o limitador percentual da aplicação.

#### Critérios de Aceitação
- Condição programática aplicada sem erros base: `(Entrada >= 0.5 * Total)`.
- Status deve mostrar-se explicitamente aprovado, burlando score negativo em banco.

---

### CT09 - Consulta de Pedido com Sucesso

#### Objetivo
Garantir que a consulta funciona sob regime de leitura e renderiza corretamente todo o pacote do contrato que foi registrado caso seja correspondente validamente na busca da API.

#### Pré-Condições
- O sistema possui ao menos 1 pedido salvo e documentado na conta.
- O acesso exige exclusivamente o identificador exato do ID do pedido respectivo (Ex: `VLO-ABC123`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Acessar área de Consulta de Pedidos (`/lookup`) | A página principal com o card de inserção de busca do status aparece na tela. |
| 2 | Inserir o `order_number` real no campo de texto | O formulário aceita a string do UUID/ID correspondente e habilita o botão local. |
| 3 | Clicar em "Buscar Pedido" | O status do loading dispara, seguido de transição em que todas os dados de consulta daquele código (Veículo, Status de Compra Integrado, Dados do Cliente) são visualizados. |

#### Resultados Esperados
- O aplicativo deve apresentar com exclusividade (Segurança de Dados) apenas os dados exigidos pelo input do pedido exato em que ele consta.

#### Critérios de Aceitação
- Somente com `order_number` o painel é carregado com as especificações integrais sem estourar quebra de autenticação em branco.

---

### CT10 - Consulta de Pedido Inexistente ou Formato Inválido (Negativo)

#### Objetivo
Validar que a aplicação não trava em caso de requisições de consulta sobre identificadores inexistentes na base.

#### Pré-Condições
- Usuário final na página de Consulta (`/lookup`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Manter o campo de id vazio ("") e não clicar fora | O botão "Buscar Pedido" mantêm-se como bloqueado (`disabled`). |
| 2 | Inserir uma identificação falsa no campo (Ex: `XYZ-555`) e clicar em "Buscar Pedido" | O evento do botão é executado chamando a via da API sem registro, e processa. |
| 3 | Avaliar tela logo em seguida | Uma janela com a mensagem destrutiva de Erro de "Pedido não encontrado" desponta perante o modal. |

#### Resultados Esperados
- Tratativa de falha e exibição de alerta que inibe qualquer consulta sem validade ou null pointer da UI na tela do Cliente.

#### Critérios de Aceitação
- Botão habilitado unicamente após digitação.
- A requisição lida com 404/Empty lançando interface amigável apropriadamente sem quebrar o roteamento da página que visualiza a exceção de Busca Negada.
