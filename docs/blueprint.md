📝 Especificação – Formulário de Cadastro de Blueprint (DataOcean Instance Manager)

📖 O que é um Blueprint?

No contexto da plataforma DataOcean Instance Manager, um Blueprint representa um modelo lógico reutilizável que define um conjunto de aplicações (templates Helm) que compõem uma solução completa. Ele não define valores específicos nem interfere nos valores padrão dos charts, os quais continuam sendo responsabilidade exclusiva de cada Helm Chart (template).

O Blueprint é utilizado como base para a criação de múltiplas instâncias específicas, cada uma adaptada conforme sua localidade, ambiente e necessidades particulares.

Cada Blueprint inclui:

- Uma lista de templates (aplicações filhas) que serão implantadas como Application no ArgoCD.
- Um conjunto opcional de variáveis reutilizáveis (Blueprint Variables), definidas no helper.tpl, que ficam disponíveis para uso no momento da criação da instância.

Durante a criação de uma instância, o Blueprint serve como modelo para gerar um Helm Chart no padrão App of Apps, customizado com os valores específicos da instância. Este Helm Chart é versionado via Git e sincronizado pelo ArgoCD para realizar o deploy.

O Blueprint é a principal unidade de reuso e padronização da plataforma, promovendo consistência entre implantações e facilitando a manutenção de ambientes complexos.

🎯 Objetivo

Criar um formulário amigável, modular e escalável para cadastro de Blueprints que permitirá:

- Seleção de templates (aplicações filhas)
- Definição opcional de Blueprint Variables reutilizáveis via helper.tpl
- Geração automática do helper.tpl com variáveis declaradas no Blueprint

🔄 Ordem das Etapas do Formulário

1. Informações Gerais

   - Nome do Blueprint
   - Descrição do Blueprint

2. Associação de Templates (Aplicações Filhas)

   - Combobox multiselect de templates registrados
   - O mesmo template poderá ser selecionado mais de uma vez, com identificadores distintos (ex: `postgres-analytics`, `postgres-vetorial`) para representar múltiplas instâncias lógicas do mesmo chart.
   - Para cada template selecionado:

     - Nome identificador único no contexto do blueprint
     - Repositório e caminho (a branch será definida posteriormente durante a criação da instância)
     - Card exibindo detalhes básicos do template

3. Definição de Blueprint Variables (helper.tpl)

   - Interface para listar, criar e editar variáveis reutilizáveis
   - Cada variável será representada por um define no helper.tpl, utilizando a função tpl do Helm
   - As variáveis não são aplicadas automaticamente em nenhum campo
   - A configuração de uma Blueprint Variable será um Go Template válido, permitindo interpolação de .Values e lógica condicional
   - Essas variáveis poderão ser utilizadas nas instâncias que utilizarem o Blueprint

   A interface oferecerá dois modos de criação de variáveis:

   - **Modo visual guiado**: com campos estruturados para nome e expressão básica, convertidos automaticamente para blocos `define`.
   - **Modo avançado (opcional)**: com editor livre de Go Template com syntax highlight, destinado a usuários experientes que desejam aplicar lógica condicional ou blocos mais complexos manualmente.

   Exemplo\:tpl {{- define "db-helper.db\_port" -}} {{ tpl ".Values.global\_config.db\_port" . }} {{- end }}

   ```

   ```

4. Preview e Validação Final

   - Visualização completa do helper.tpl (variáveis declaradas)
   - Validações:

     - Sintaxe TPL
     - Conflitos de nomes de variáveis

5. Resumo e Confirmação

   - Apresentação de todos os dados agrupados:

     - Informações gerais
     - Templates associados
     - Blueprint Variables

   - Botão de confirmação com animação de loading e feedback visual (toast)

📦 Geração Esperada do Blueprint

Estrutura:

```
app-of-apps/
├── Chart.yaml
└── templates/
    ├── helper.tpl
    ├── backend-app.yaml
    └── database-app.yaml
```

Exemplo de helper.tpl:

```tpl
{{- define "helper.app_name" -}}
insights
{{- end }}

{{- define "helper.namespace" -}}
default
{{- end }}

{{- define "helper.memory" -}}
1Gi
{{- end }}
```

🔄 Considerações Estratégicas

- O Blueprint **não define valores default** dos charts. Todos os valores default devem estar definidos nos respectivos templates Helm.
- As Blueprint Variables são **variáveis reutilizáveis opcionais**, disponíveis para uso durante a criação da instância, mas não aplicadas automaticamente.
- O Blueprint será armazenado internamente no banco de dados da plataforma.
- O versionamento Git ocorrerá apenas no momento da criação da instância, quando o Blueprint for transformado em um Helm Chart completo (AppOfApps).
- Exportação como pacote reutilizável e biblioteca global de variáveis são possibilidades futuras.

✅ Benefícios da Abordagem

- Separação clara de responsabilidades: valores default nos templates, orquestração nos Blueprints, customizações nas instâncias.
- Menor acoplamento entre Blueprint e estrutura interna dos charts.
- Maior reutilização e padronização com liberdade de aplicação.
- Estrutura previsível e pronta para integração com ArgoCD.
