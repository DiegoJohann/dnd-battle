# D&D Battle

Aplicação web para controle rápido de encontros de Dungeons & Dragons durante a mesa. O foco do projeto é reduzir o trabalho operacional do mestre: ordenar iniciativa, acompanhar turnos, aplicar dano/cura, controlar HP temporário, marcar condições e gerenciar slots de magia sem precisar sair da tela de combate.

## Funcionalidades

- Cadastro de combatentes jogadores e NPCs com nome, HP, CA, iniciativa e tipo.
- Adição de grupos de monstros com nomes sequenciais, atributos compartilhados e iniciativa individual opcional.
- Ordenação automática por iniciativa.
- Rastreador de turno ativo com rodada atual, avanço, retorno e reset com confirmação.
- Destaque visual do combatente ativo.
- Aplicação de dano, cura e HP temporário por Enter ou botão, com seleção automática dos campos ao focar.
- Estado visual explícito para combatentes em 0 HP.
- Condições de D&D com seletor em popover, tooltip traduzido e duração opcional.
- Duração de condição indefinida, até o início do próximo turno do alvo, ou de 1 a 10 turnos do próprio alvo.
- Controle de slots de magia por nível, com modal completo e consumo rápido pelo popover do card.
- Remoção de combatente protegida em menu/diálogo para evitar erro durante a sessão.
- Limpeza seletiva do campo: NPCs, jogadores ou todos.
- Internacionalização em Português do Brasil, Espanhol e Inglês US.
- Persistência local no navegador via `localStorage`.

## Como Rodar

Instale as dependências:

```bash
npm install
```

Inicie o servidor local:

```bash
npm run start
```

Acesse `http://localhost:4200/`.

Para gerar build de produção:

```bash
npm run build
```

## Uso Durante o Combate

### Combatentes

Use **Adicionar Combatente** para inserir jogadores ou NPCs. A lista é ordenada automaticamente pela iniciativa, da maior para a menor. A iniciativa ainda pode ser editada diretamente no card, e a ordem é recalculada após a alteração.

No cadastro, alterne entre **Único** e **Grupo** para criar vários monstros de uma vez. Em grupo, informe nome base e quantidade para gerar combatentes como `Goblin 1`, `Goblin 2`, etc. HP, CA e tipo são compartilhados. A iniciativa pode ser igual para todos ou rolada individualmente como `d20 + modificador de iniciativa`.

### Turnos e Rodadas

O rastreador no topo mostra a rodada atual e o combatente ativo. Use os botões de turno ou os atalhos de teclado para avançar e voltar. Ao passar do último combatente para o primeiro, a rodada aumenta automaticamente.

O botão de reset de turno abre uma confirmação antes de voltar para a rodada 1 e selecionar o primeiro combatente da ordem atual.

### HP, Dano, Cura e HP Temporário

Cada card permite aplicar dano, cura e HP temporário rapidamente. Ao focar um campo numérico, o valor é selecionado para permitir digitação direta. Dano consome HP temporário antes do HP normal. Quando o HP normal chega a 0, o card mostra estado de inconsciência/morte de forma mais evidente.

HP temporário tem controle rápido para limpar o valor quando o efeito termina.

### Condições

O popover de condições permite marcar e remover condições do combatente. Cada condição pode ter uma duração:

- `∞`: permanece até ser removida manualmente.
- `Início`: termina no início do próximo turno do próprio combatente afetado.
- `1` a `10`: dura essa quantidade de turnos do próprio combatente afetado.

Essa lógica evita que uma condição aplicada no fim da rodada perca duração antes do alvo ter uma oportunidade real de agir.

### Slots de Magia

O botão discreto de magia no card abre um popover com resumo dos slots por nível e ações rápidas para gastar um slot. O modal completo permite editar totais e restantes por nível, restaurar todos os slots e concluir com Enter.

### Idioma

O seletor de idioma alterna entre:

- Português do Brasil
- Español
- English US

As traduções ficam em `src/assets/i18n/`.

## Atalhos de Teclado

Atalhos globais são ignorados enquanto o foco está em campos de texto, campos numéricos, seletores ou áreas editáveis. Também são bloqueados enquanto um modal está aberto, exceto `Escape`. Modais de confirmação focam uma opção segura por padrão e mantêm a navegação por `Tab` dentro do próprio modal.

| Atalho | Função |
| --- | --- |
| `A` | Abrir cadastro de combatente |
| `ArrowRight` | Próximo turno |
| `N` | Próximo turno |
| `ArrowLeft` | Turno anterior |
| `P` | Turno anterior |
| `R` | Abrir confirmação para resetar turno e rodada |
| `C` | Abrir modal de limpeza do campo |
| `Escape` | Fechar modais, popovers e diálogos abertos |
| `Tab` em modais | Navegar entre ações disponíveis sem sair do modal |
| `Enter` no modal de magias | Concluir e fechar o modal |
| `Enter` em campos de dano, cura, HP temporário e iniciativa | Aplicar ou atualizar o valor do campo |
| `Enter` no cadastro de combatente | Avançar entre campos do formulário |

## Estrutura Técnica

- Angular standalone components.
- `@ngx-translate/core` para i18n.
- `lucide-angular` para ícones.
- SCSS global em `src/styles.scss` com tokens de tema e padrões reutilizáveis.
- `HotkeysService` em `src/app/core/hotkeys/` para centralizar atalhos globais da tela de batalha.
- Entidades principais em `src/app/core/entities/`.

## Persistência Local

Os dados são salvos no navegador:

- `battle`: lista de combatentes e seus estados.
- `battle-turn`: rodada atual e combatente ativo.
- `dnd-battle-language`: idioma selecionado.

Como a persistência é local, limpar os dados do navegador remove o estado da batalha.

## Scripts

```bash
npm run start
npm run build
npm run test
```
