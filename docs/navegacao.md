# DataOcean Instance Manager - Gerenciamento de Recursos

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades Principais](#funcionalidades-principais)
  - [Gerenciamento de Templates](#gerenciamento-de-templates)
  - [Gerenciamento de Blueprints](#gerenciamento-de-blueprints)
- [Interface e Navegação](#interface-e-navegação)
- [Fluxos de Trabalho](#fluxos-de-trabalho)
- [Recursos de Usabilidade](#recursos-de-usabilidade)
- [Benefícios](#benefícios)
- [Considerações Técnicas](#considerações-técnicas)

---

## 🎯 Visão Geral

O módulo de **Gerenciamento de Recursos** do DataOcean Instance Manager é uma interface centralizada para administrar templates de Helm Charts e blueprints de aplicações. Esta interface permite que administradores e desenvolvedores gerenciem os recursos necessários para a criação e implantação de instâncias de aplicações em ambientes Kubernetes.

### Principais Objetivos

- 📦 **Centralizar** o gerenciamento de templates e blueprints
- 🚀 **Simplificar** o processo de criação de instâncias
- ✅ **Validar** recursos antes da implantação
- 🔄 **Reutilizar** configurações através de blueprints

---

## 🛠️ Funcionalidades Principais

### 📦 Gerenciamento de Templates

#### 1. **Visualização de Templates**

| Modo       | Descrição                                    | Ideal para                            |
| ---------- | -------------------------------------------- | ------------------------------------- |
| **Tabela** | Visualização compacta com colunas ordenáveis | Análise rápida de múltiplos templates |
| **Grid**   | Cards visuais com mais detalhes              | Navegação visual e descoberta         |

#### 2. **Filtragem e Busca**

- 🔍 **Busca textual**: Por nome, descrição ou repositório
- 🏷️ **Filtro por tipo**: Backend, Frontend, Database, Infrastructure, Monitoring, Security
- 📊 **Filtro por status**: Ativo ou Depreciado
- 📄 **Paginação configurável**: 10, 25 ou 50 itens por página

#### 3. **Ordenação**

Campos ordenáveis:

- Nome (A-Z / Z-A)
- Categoria
- Data de atualização

#### 4. **Operações em Lote**

- ✅ Seleção múltipla via checkboxes
- 🗑️ Exclusão em lote
- 📋 Duplicação (quando apenas um template está selecionado)

#### 5. **Operações Individuais**

| Ação                | Descrição                    | Ícone |
| ------------------- | ---------------------------- | ----- |
| **Criar**           | Adicionar novo template      | ➕    |
| **Editar**          | Modificar template existente | ✏️    |
| **Excluir**         | Remover template             | 🗑️    |
| **Duplicar**        | Criar cópia do template      | 📋    |
| **Ver Repositório** | Acessar repositório Git      | 📁    |

#### 6. **Validação de Helm Charts**

````mermaid title="Fluxo de Validação" type="diagram"
graph LR
    A["Informar Branch"] --> B["Conectar ao Git"]
    B --> C["Verificar Arquivos"]
    C --> D{"Validação OK?"}
    D -->|Sim| E["✅ Sucesso"]
    D -->|Não| F["❌ Erro"]
    E --> G["Mostrar Detalhes"]
    F --> H["Mostrar Problemas"]

**Arquivos verificados:**

- ✅ Chart.yaml (obrigatório)
- ✅ values.yaml (obrigatório)
- ⚡ values.schema.json (opcional, habilita editor visual)


### 🎨 Gerenciamento de Blueprints

#### 1. **Visualização de Blueprints**

Cards visuais contendo:

- 🟢 Indicador de status (ativo/inativo)
- 📦 Lista de templates associados
- 🔢 Contagem de instâncias criadas
- 📅 Data de criação


#### 2. **Operações com Blueprints**

- **Criar Blueprint**: Assistente passo-a-passo
- **Editar Blueprint**: Modificar configurações
- **Duplicar Blueprint**: Criar variações
- **Excluir Blueprint**: Remover blueprint
- **Criar Instância**: Implantar aplicação


---

## 🖥️ Interface e Navegação

### 📐 Estrutura da Interface

```plaintext
┌─────────────────────────────────────────────────────────┐
│  📊 Gerenciamento de Recursos          DataOcean ⚙️     │
│  12 de 45 templates encontrados                         │
├─────────────────────────────────────────────────────────┤
│  [Templates (45)] [Blueprints (12)]                     │
├─────────────────────────────────────────────────────────┤
│  🔍 [Buscar...]  [Tipo ▼] [Status ▼]  [📋|⊞] [+ Novo]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Área de Conteúdo Principal                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [← Anterior] Página 1 de 5 [Próxima →]  [10/página ▼] │
└─────────────────────────────────────────────────────────┘
````

### 🎨 Elementos Visuais

#### Cards de Templates (Modo Grid)

```plaintext
┌─────────────────────────┐
│ ☐               [Ativo] │
│ ├─────────────────────┤ │
│ │  🗄️  PostgreSQL     │ │
│ │      [Database]     │ │
│ ├─────────────────────┤ │
│ │ Template para       │ │
│ │ banco de dados...   │ │
│ ├─────────────────────┤ │
│ │ 📁 /repo/path       │ │
│ │ 📅 2024-01-15       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## 🔄 Fluxos de Trabalho

### 📝 Criação de Template

```mermaid
Fluxo de Criação de Template.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-rd42{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-rd42 .error-icon{fill:#552222;}#mermaid-diagram-rd42 .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-rd42 .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-rd42 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-rd42 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-rd42 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-rd42 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-rd42 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-rd42 .marker{fill:#666;stroke:#666;}#mermaid-diagram-rd42 .marker.cross{stroke:#666;}#mermaid-diagram-rd42 svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-rd42 p{margin:0;}#mermaid-diagram-rd42 .label{font-family:var(--font-geist-sans);color:#000000;}#mermaid-diagram-rd42 .cluster-label text{fill:#333;}#mermaid-diagram-rd42 .cluster-label span{color:#333;}#mermaid-diagram-rd42 .cluster-label span p{background-color:transparent;}#mermaid-diagram-rd42 .label text,#mermaid-diagram-rd42 span{fill:#000000;color:#000000;}#mermaid-diagram-rd42 .node rect,#mermaid-diagram-rd42 .node circle,#mermaid-diagram-rd42 .node ellipse,#mermaid-diagram-rd42 .node polygon,#mermaid-diagram-rd42 .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-rd42 .rough-node .label text,#mermaid-diagram-rd42 .node .label text{text-anchor:middle;}#mermaid-diagram-rd42 .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-rd42 .node .label{text-align:center;}#mermaid-diagram-rd42 .node.clickable{cursor:pointer;}#mermaid-diagram-rd42 .arrowheadPath{fill:#333333;}#mermaid-diagram-rd42 .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-rd42 .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-rd42 .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-rd42 .edgeLabel p{background-color:white;}#mermaid-diagram-rd42 .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-rd42 .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-rd42 .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-rd42 .cluster text{fill:#333;}#mermaid-diagram-rd42 .cluster span{color:#333;}#mermaid-diagram-rd42 div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:var(--font-geist-sans);font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-rd42 .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-rd42 .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-rd42 .marker,#mermaid-diagram-rd42 marker,#mermaid-diagram-rd42 marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rd42 .label,#mermaid-diagram-rd42 text,#mermaid-diagram-rd42 text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-rd42 .background,#mermaid-diagram-rd42 rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-rd42 .entityBox,#mermaid-diagram-rd42 .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-rd42 .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-rd42 .label-container,#mermaid-diagram-rd42 rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rd42 line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rd42 :root{--mermaid-font-family:var(--font-geist-sans);}✅ Template Criado
```

**Campos do formulário:**

1. **Nome do Template** _(obrigatório)_
2. **Tipo/Categoria** _(obrigatório)_
3. **Repositório Git** _(obrigatório)_
4. **Caminho no Repositório** _(obrigatório)_
5. **Descrição** _(opcional)_

### 🔧 Gerenciamento em Lote

1. **Selecionar templates** usando checkboxes
2. **Escolher ação**:

3. 🗑️ Excluir selecionados
4. 📋 Duplicar (apenas com 1 selecionado)

5. **Confirmar ação**

### 🎯 Criação de Blueprint

```mermaid
Assistente de Blueprint.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-rd6l{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-rd6l .error-icon{fill:#552222;}#mermaid-diagram-rd6l .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-rd6l .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-rd6l .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-rd6l .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-rd6l .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-rd6l .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-rd6l .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-rd6l .marker{fill:#666;stroke:#666;}#mermaid-diagram-rd6l .marker.cross{stroke:#666;}#mermaid-diagram-rd6l svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-rd6l p{margin:0;}#mermaid-diagram-rd6l .label{font-family:var(--font-geist-sans);color:#000000;}#mermaid-diagram-rd6l .cluster-label text{fill:#333;}#mermaid-diagram-rd6l .cluster-label span{color:#333;}#mermaid-diagram-rd6l .cluster-label span p{background-color:transparent;}#mermaid-diagram-rd6l .label text,#mermaid-diagram-rd6l span{fill:#000000;color:#000000;}#mermaid-diagram-rd6l .node rect,#mermaid-diagram-rd6l .node circle,#mermaid-diagram-rd6l .node ellipse,#mermaid-diagram-rd6l .node polygon,#mermaid-diagram-rd6l .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-rd6l .rough-node .label text,#mermaid-diagram-rd6l .node .label text{text-anchor:middle;}#mermaid-diagram-rd6l .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-rd6l .node .label{text-align:center;}#mermaid-diagram-rd6l .node.clickable{cursor:pointer;}#mermaid-diagram-rd6l .arrowheadPath{fill:#333333;}#mermaid-diagram-rd6l .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-rd6l .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-rd6l .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-rd6l .edgeLabel p{background-color:white;}#mermaid-diagram-rd6l .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-rd6l .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-rd6l .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-rd6l .cluster text{fill:#333;}#mermaid-diagram-rd6l .cluster span{color:#333;}#mermaid-diagram-rd6l div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:var(--font-geist-sans);font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-rd6l .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-rd6l .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-rd6l .marker,#mermaid-diagram-rd6l marker,#mermaid-diagram-rd6l marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rd6l .label,#mermaid-diagram-rd6l text,#mermaid-diagram-rd6l text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-rd6l .background,#mermaid-diagram-rd6l rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-rd6l .entityBox,#mermaid-diagram-rd6l .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-rd6l .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-rd6l .label-container,#mermaid-diagram-rd6l rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rd6l line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rd6l :root{--mermaid-font-family:var(--font-geist-sans);}InformaçõesTemplatesVariáveisValidaçãoConfirmação
```

---

## 💡 Recursos de Usabilidade

### 👁️ Feedback Visual

- **Indicadores de Status**

- 🟢 Ativo: Badge verde
- 🟠 Depreciado: Badge cinza
- ⏳ Carregando: Spinner animado

- **Estados da Interface**

- Loading: Indicador de carregamento
- Empty: Mensagem quando não há dados
- Error: Mensagens de erro claras

### 🖱️ Interações Intuitivas

- **Hover Effects**: Destaque visual ao passar o mouse
- **Drag & Drop**: Para reordenar elementos (futuro)
- **Atalhos**: Teclas de atalho para ações comuns
- **Confirmações**: Diálogos para ações destrutivas

### ✅ Validação e Prevenção de Erros

```plaintext
❌ Campo obrigatório vazio
⚠️ Formato inválido
✅ Validação bem-sucedida
```

---

## 🎯 Benefícios

### 📈 Produtividade Aprimorada

| Recurso                    | Benefício                                |
| -------------------------- | ---------------------------------------- |
| **Interface Centralizada** | Acesso rápido a todos os recursos        |
| **Operações em Lote**      | Economia de tempo em tarefas repetitivas |
| **Validação Integrada**    | Detecção precoce de problemas            |
| **Filtros e Busca**        | Localização rápida de recursos           |

### 🛡️ Redução de Erros

- ✅ Validação de charts antes da criação
- ✅ Feedback visual claro sobre status
- ✅ Confirmações para ações destrutivas
- ✅ Formulários com validação em tempo real

### 📊 Melhor Organização

- Categorização clara por tipo
- Status visível de cada recurso
- Relacionamento entre templates e blueprints
- Histórico de atualizações

---

## ⚙️ Considerações Técnicas

### 🔗 Integração com Git

```yaml
Funcionalidades:
  - Validação direta do repositório
  - Suporte a múltiplas branches
  - Verificação de arquivos essenciais
  - Autenticação via PAT (Personal Access Token)
```

### 📊 Escalabilidade

- **Paginação**: Suporte a grandes volumes de dados
- **Filtragem**: Processamento eficiente no servidor
- **Cache**: Otimização de consultas frequentes
- **Lazy Loading**: Carregamento sob demanda

### 🔧 Extensibilidade

- Arquitetura modular
- Componentes reutilizáveis
- API RESTful para integrações
- Suporte a plugins (futuro)

### 📱 Responsividade

| Dispositivo | Experiência                                     |
| ----------- | ----------------------------------------------- |
| **Desktop** | Interface completa com todas as funcionalidades |
| **Tablet**  | Layout adaptado com menus condensados           |
| **Mobile**  | Interface simplificada para telas pequenas      |

---

## 🚀 Próximos Passos

1. **Implementar busca avançada** com múltiplos critérios
2. **Adicionar histórico de alterações** para auditoria
3. **Criar dashboard analítico** com métricas de uso
4. **Implementar importação/exportação** em massa
5. **Adicionar suporte a webhooks** para automação
