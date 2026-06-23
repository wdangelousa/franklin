# OneBridge Stalwart — Design System & Peças Digitais

Identidade visual em código, derivada do site e do logo oficial da OneBridge Stalwart.
Tudo aqui é **autossuficiente** e abre direto no navegador — sem build.

## Arquivos

| Arquivo | O que é | Como usar |
|---|---|---|
| `tokens.css` | **Fonte única de verdade**: cores, tipografia, espaçamento, raios, sombras como variáveis CSS. | `<link rel="stylesheet" href="tokens.css">` e use `var(--ob-...)`. |
| `design-system.html` | Styleguide vivo: paleta, tipografia, uso do logo, botões, badges, cards. | Abra no navegador. É a referência visual da marca. |
| `email-signature.html` | Assinatura de e-mail (tabela + estilos inline, à prova de Gmail/Outlook). Versão completa e compacta. | Abra, selecione a assinatura, copie e cole no cliente de e-mail. |
| `letterhead.html` | Timbrado A4 pronto para impressão/PDF. | Abra, preencha o corpo, clique **Imprimir / Salvar PDF**. |
| `assets/` | Logos: tinta, branco (knockout), símbolo e símbolo em limão. | Use a versão tinta em fundo claro e a branca em fundo escuro. |

## Marca em 30 segundos

- **Tinta (Ink) `#1C1E29`** — cor do logo. Títulos, fundos escuros, texto principal.
- **Limão (Lime) `#C8E64E`** — acento de ação. CTAs e destaques. Texto sobre o limão é **sempre** tinta.
- **Tipografia** — **Sora** (títulos/números) + **Inter** (corpo/interface). Ambas no Google Fonts.
- **Logo** — respiro mínimo = altura do símbolo. Nunca distorcer, recolorir fora da paleta ou aplicar sombra.

## Tokens principais

```css
--ob-ink:   #1C1E29;   /* marca / títulos / fundos escuros */
--ob-lime:  #C8E64E;   /* acento de ação / CTA            */
--ob-paper: #FFFFFF;   /* fundo base                       */
--ob-mist:  #F4F6F3;   /* seção clara alternada            */
--ob-muted: #6B7280;   /* texto secundário                 */

--ob-font-display: "Sora", system-ui, sans-serif;   /* títulos */
--ob-font-sans:    "Inter", system-ui, sans-serif;  /* corpo   */
```

A lista completa está em `tokens.css`.

## Personalizar

Os modelos usam marcadores `‹ ›` (ex.: `‹Nome Sobrenome›`, `‹Cargo›`). Troque pelos dados reais.
A assinatura de e-mail referencia o logo por URL pública (`onebridgestalwart.com/logomark.png`) —
garanta que o arquivo esteja publicado lá, pois clientes de e-mail não carregam imagens locais.

## Próximas peças (mesma base)

Para criar novas peças (capa de proposta, one-pager, slides, avatar/capa de redes sociais),
importe `tokens.css`, carregue as fontes Sora + Inter e reutilize os componentes do
`design-system.html`. Assim qualquer arquivo novo já nasce consistente com a marca.
