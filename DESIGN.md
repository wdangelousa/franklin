# Design System: Franklin

## 1. Visual Theme & Atmosphere

Franklin usa uma linguagem visual editorial e consultiva, com sensação de software premium sem parecer frio. A atmosfera é quente, calma e densa o suficiente para operações internas, mas ainda aberta para leitura pública de propostas. O sistema funciona melhor quando cada tela deixa claro se o usuário está em um contexto de decisão, operação ou consulta.

Princípios de atmosfera:

- Elegância funcional: menos aparência de dashboard genérico, mais sensação de documento estratégico vivo.
- Calor institucional: fundos claros e cremosos, sem branco duro.
- Densidade controlada: muito conteúdo é aceitável, desde que a hierarquia seja óbvia.
- Clareza operacional: ações e status devem aparecer antes de texto explicativo longo.

## 2. Color Palette & Roles

- Warm Paper `#f4efe7`: base principal de fundo.
- Soft Sand `#e7ddd1`: profundidade suave para o pano de fundo.
- Porcelain Surface `rgba(255, 251, 246, 0.86)`: superfícies translúcidas padrão.
- Strong Porcelain `#fffaf3`: superfícies mais sólidas e blocos de leitura.
- Ink Brown `#201b16`: texto principal.
- Muted Taupe `#685d53`: texto secundário e explicações.
- Bronze Brand `#8f5f36`: cor principal de marca e destaques quentes.
- Deep Bronze `#5b3418`: gradiente de CTA e títulos de apoio.
- Forest Accent `#173b34`: estados de ênfase operacional e contraste institucional.
- Forest Mist `rgba(23, 59, 52, 0.08)`: fundos suaves de destaque e callouts.
- Success Green `#2f6c55`: sucesso, aceite e conclusão.
- Warning Ochre `#916121`: atenção, expiração e limites temporários.
- Danger Red `#9b2c2c`: erro e falhas críticas.

Regras de uso:

- `brand` e `brand-deep` devem liderar ações primárias e acentos quentes.
- `accent` deve aparecer em estados institucionais, resumos e destaques de confiança.
- `muted` nunca deve competir com texto principal; serve para contexto, não para instrução crítica.

## 3. Typography Rules

Tipografia principal:

- Títulos: família serifada editorial, com presença e contraste forte.
- Corpo: sans humanista, limpa e estável para leitura longa.
- Valores monetários: serif com números tabulares para sensação financeira e precisão.

Regras:

- `h1` deve sempre parecer capa ou seção de documento, não label de sistema.
- `h2` organiza blocos internos e deve preservar balanço de linha.
- Labels em `eyebrow` são pequenos, em caixa alta, e funcionam como orientação semântica.
- Corpo de texto deve ficar preferencialmente dentro de 60 a 72 caracteres por linha quando possível.

## 4. Component Stylings

### Buttons

- Botão primário: formato pill, gradiente Bronze Brand para Deep Bronze, presença clara.
- Botão secundário: fundo translúcido claro, borda sutil, comportamento de apoio.
- Em mobile, ações principais devem ocupar largura total quando fizer sentido operacional.

### Cards and Containers

- Cards principais: cantos generosamente arredondados, fundo translúcido quente, sombra difusa e suave.
- Cards operacionais: podem ser mais densos, mas devem manter respiro interno consistente.
- Cards públicos de decisão: usar faixas suaves com `accent` e `brand` para transmitir confiança e controle.

### Status Pills

- Formato pill compacto, sempre em caixa alta.
- Devem funcionar como sinais rápidos de estado, não como conteúdo descritivo longo.

### Lists and Records

- Listas internas devem parecer blocos operacionais escaneáveis.
- Cada item precisa expor primeiro o nome, depois status e metadados, depois a ação.
- Nunca depender apenas de texto corrido para transmitir urgência ou disponibilidade.

### Forms and Inputs

- Campos com fundo claro e borda suave.
- Altura mínima confortável para toque.
- Em fluxos públicos, o próximo passo deve ficar visualmente próximo do contexto que o justifica.

## 5. Layout Principles

- O shell interno trabalha em duas camadas: navegação escura lateral e palco claro de conteúdo.
- Cabeçalhos devem separar claramente contexto, objetivo e ações.
- Páginas analíticas usam blocos de overview antes de listas detalhadas.
- Páginas operacionais usam resumo curto seguido por itens escaneáveis.
- Fluxos públicos devem priorizar confiança, contexto e ação, nesta ordem.

Regras de composição:

- Evitar grids genéricos para conteúdo semântico diferente.
- Usar variantes próprias para catálogo, listas operacionais e etapas públicas.
- Manter espaçamento vertical generoso entre seções principais.
- Em telas pequenas, converter ações laterais em empilhamento vertical e reduzir competição visual.

## 6. UX Guidance By Surface

### Internal Admin Screens

- Mostrar a leitura rápida do estado da operação antes dos detalhes.
- Transformar listas em registros claros, com ação visível.
- Evitar blocos de texto aspiracional em áreas de trabalho frequente.

### Proposal Builder

- O usuário deve sempre saber em que etapa está, o que falta e qual impacto financeiro atual existe.
- Estados vazios precisam explicar como destravar a operação, não apenas informar ausência de dados.

### Public Proposal Flow

- A confiança vem de contexto, status e clareza de próximos passos.
- O cliente deve entender rapidamente: o que é isto, quanto custa, até quando vale, o que acontece se aceitar.
- Aceite, checklist e PDF são três momentos diferentes e precisam ter identidade semelhante, mas propósito explícito.

## 7. Anti-Patterns To Avoid

- Cards estreitos demais para títulos longos.
- Texto institucional longo antes da informação acionável.
- Filtros e ações espalhados sem agrupamento visual.
- Listas que parecem tabelas quebradas em vez de blocos operacionais.
- Explicações de “futuro” ou “automação” em pontos onde o usuário precisa de certeza operacional hoje.