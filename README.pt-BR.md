# Vialite

[English](README.md) · [简体中文](README.zh-CN.md) · **Português (Brasil)**

![Vialite aguardando um teclado conectar](public/preview/connection.png)

![O editor de keymap do Vialite](public/preview/keyboard-layout.png)

<details>
<summary>▶️ Assista ao vídeo de demonstração de 30 segundos</summary>

https://github.com/user-attachments/assets/1098467b-e887-43f8-916a-9941419393d3

</details>

Um configurador web nativo para teclados com protocolo [Vial](https://get.vial.today/), conversando com o teclado diretamente pelo [WebHID](https://developer.mozilla.org/pt-BR/docs/Web/API/WebHID_API) — sem Qt, sem WebAssembly e sem instalação de driver.

Este é um frontend web escrito do zero, não um empacotador de build em torno do `vial-gui`/`vial-web` oficial (que compila um aplicativo de desktop PyQt5 para WebAssembly). O próprio protocolo HID do Vial é reimplementado em TypeScript em `src/protocol/`, portado da implementação Python do [`vial-gui`](https://github.com/vial-kb/vial-gui).

## Recursos

Cada item abaixo corresponde a uma página na barra lateral do aplicativo, na ordem em que aparece:

| Página | O que faz |
| --- | --- |
| **Configuração do teclado** | O editor de keymap principal — atribua keycodes por camada com um seletor em cascata e um painel de configuração rápida, sobre um renderizador completo de layout físico (ISO-Enter, encoders rotativos, opções de layout). Inclui um editor dedicado para teclas de função dupla (layer-tap / mod-tap). |
| **Personalização** | Aparência do teclado na tela: tamanho e espaçamento dos keycaps, ajuste automático, raio e espessura da carcaça, fonte / tamanho / cor / posição da legenda, nomenclatura de teclas do macOS vs Windows — além de exportação de PNG com um clique da camada atual ou de todas as camadas. |
| **Macros** | Grave e edite sequências de macro. *(Requer suporte do dispositivo.)* |
| **Tap Dance** | Configure ações de toque único / toque duplo e hold / tap-hold. *(Requer suporte do dispositivo.)* |
| **Combos** | Defina combos de múltiplas teclas com cartões de pré-visualização e reordenação. *(Requer suporte do dispositivo.)* |
| **Substituições de teclas** | Troque uma tecla de gatilho por outra com base em modificadores exigidos / proibidos e camadas ativas. *(Requer suporte do dispositivo.)* |
| **Iluminação RGB** *(Beta)* | Controle VialRGB (QMK `rgb_matrix`): efeito, matiz/saturação/brilho e velocidade. As alterações são apenas na RAM até você clicar em Salvar, o que as grava na EEPROM. |
| **Importar / Exportar** | Leia e grave arquivos de layout `.vil` através do serializador reimplementado. |
| **Teste de teclado** | Diagnóstico de matriz com fluxo de desbloqueio e polling para verificar cada switch. *(Requer suporte do dispositivo.)* |
| **Configurações do QMK** | Grave-escape, magic, one-shot, tap-hold, teclas do mouse e temporização de combo, com um índice na barra lateral que se mantém sincronizado com a rolagem da página. |
| **Pré-visualização 3D** *(Beta)* | Renderiza o seu layout atual em um modelo de teclado 3D. |
| **Configurações do site** | Idioma (中文 / English / 日本語 / Français / Português), tema claro / escuro, registro de depuração e redefinição de cache. As preferências persistem em `localStorage`. |

Páginas que dependem das capacidades do dispositivo (Macros, Tap Dance, Combos, Substituições de teclas, Teste de teclado) aparecem esmaecidas quando o teclado conectado não as suporta. A Iluminação RGB permanece acessível em qualquer placa e explica na própria página quando o firmware não tem iluminação VialRGB.

A interface oferece suporte a inglês, chinês simplificado, japonês, francês e português do Brasil (dicionário escrito à mão, sem biblioteca de i18n); as legendas dos keycaps permanecem em inglês para corresponder ao `vial-gui`.

## Requisitos

- Chrome ou Edge (WebHID não é suportado no Safari nem no Firefox — veja [caniuse.com/webhid](https://caniuse.com/webhid))
- Node.js
- [pnpm](https://pnpm.io/)

## Desenvolvimento

```
pnpm install         # instala as dependências
pnpm dev             # inicia o servidor de desenvolvimento do Vite
pnpm build           # tsc -b (verificação de tipos) + vite build
pnpm test            # executa a suíte de testes (vitest)
pnpm preview         # pré-visualiza a build de produção
```

Abra a URL localhost impressa no Chrome/Edge, clique em Conectar e escolha seu teclado Vial no seletor de dispositivos.

O `tsc -b` do `pnpm build` (modo estrito) é o principal portão de correção; não há uma etapa de lint separada. A CI executa `pnpm build` e depois `pnpm test` em push/PR para a branch `main`.

## Estrutura do projeto

- `src/protocol/` — a reimplementação do protocolo HID do Vial/VIA independente de framework (transporte, cliente de teclado, tabelas de keycode, parser KLE, serialização `.vil`, macros). `keycodes.ts` contém as tabelas brutas de keycode (`KEYCODE_CATEGORIES`, `label()`).
- `src/components/keymap/keycodeMeta.ts` — a única fonte de verdade para os **metadados de UI** de keycode: a hierarquia de categoria/subgrupo (`BASIC_GROUPS`, `LAYER_GROUPS`, `QUANTUM_GROUPS`, …), as chaves de descrição por categoria/grupo/tecla (`CATEGORY_KEYS`, `CATEGORY_DESC`, `CLEAR_LABELS`, `KEYCODE_HELP`) e as categorias ao vivo do dispositivo conectado (`deviceCategories()`). Toda view que mostra uma tecla, seu rótulo, sua descrição ou um cabeçalho de categoria lê daqui (com o texto de descrição resolvido por `src/contexts/i18n.tsx`) — nunca de uma tabela embutida em um componente.
- `src/components/` — a UI em React, organizada em um diretório por preocupação (`keymap`, `layout`, `macro`, `tapdance`, `combo`, `color`, `qmk`, `matrix`, `io`, `connect`, `shell`, `site`, `common`).
- `src/contexts/` — contextos React para i18n, temas, configurações de exibição de teclas e aparência da pré-visualização, e toasts.
- `src/App.tsx` — estado de nível superior e fiação (sem biblioteca de estado externa).

## Licença

O Vialite é licenciado sob a [GNU General Public License v2.0](LICENSE) (GPL-2.0).

A camada de protocolo em `src/protocol/` é portada do [`vial-gui`](https://github.com/vial-kb/vial-gui), o cliente de desktop oficial do Vial, que é © os contribuidores do Vial e licenciado sob GPL-2.0. Como obra derivada, o Vialite carrega a mesma licença. Agradecimentos ao projeto [Vial](https://get.vial.today/) pelo design do protocolo, pela implementação de referência e pelo firmware do lado do teclado que tornam este configurador possível.
