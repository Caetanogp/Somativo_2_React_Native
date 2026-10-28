# Rascunho do PDF de entrega - Somativo React Native

> Este arquivo é o conteúdo do PDF. Preencha os campos entre [colchetes], cole os screenshots e exporte
> para **um único PDF**. Entregue pelo **campo oficial da atividade** (entrega por comentário: −30%).
> **Todos** os integrantes precisam constar na capa com o **nome completo** (quem faltar fica com nota ZERO).

---

## Capa

- **Disciplina:** Mobile Development: Framework - 6º A
- **Professor:** Mark Joselli
- **Data de entrega:** 02/11/2026
- **Projeto:** DigiDex - catálogo interativo de Digimon
- **Tema escolhido:** Digimon (Digi-API)
- **Integrantes (nome completo):**
  1. Caetano Padoin
  2. Rafael Gabardo
  3. Matheus Brehm
  4. Davi Henrique

---

## Seção 1 - Links

- **Repositório GitHub (público):** https://github.com/Caetanogp/Somativo_2_React_Native - o README explica como rodar (`npx expo start`).
- **Vídeo (YouTube, público):** https://youtu.be/ILyOg3Uxkkk - duração: 8 min 44 s.

## Seção 2 - Tema e configuração

- **Tema e API:** Digimon, [Digi-API](https://digi-api.com/api/v1) - lista paginada (`/digimon?page=&pageSize=`),
  busca (`/digimon?name=&level=`) e detalhe (`/digimon/{id}`). Não é a mesma API do Somativo de Flutter
  (Rick and Morty).
- **Idioma do conteúdo:** a descrição de cada Digimon vem da Digi-API, que só oferece **inglês e japonês**.
  Escolhemos o inglês (`pickDescription` em `src/services/digimonService.ts`), sempre passando por `stripHtml`
  (RF03). Todos os textos da interface do app (botões, mensagens, títulos) estão em português.
- **Opção de persistência:** **Local** - AsyncStorage (favoritos e capturados, separados por usuário). O código
  também tem suporte a Firebase Firestore, mas ele fica **desativado** nesta entrega (sem variáveis de ambiente).
- **Opção de login:** **Local** - cadastro e login salvos no aparelho, com senha protegida por sal + hash SHA-256
  (`expo-crypto`) e sessão no `expo-secure-store`.

## Seção 3 - Autoavaliação dos requisitos funcionais

| RF | Implementado | Arquivo principal |
|---|---|---|
| RF01 - Catálogo, FlatList e paginação | Sim | `src/screens/CatalogScreen.tsx`, `src/hooks/usePaginatedList.ts` |
| RF02 - Navegação | Sim | `src/navigation/AppStack.tsx`, `src/screens/DetailsScreen.tsx` |
| RF03 - Detalhes do item | Sim | `src/screens/DetailsScreen.tsx`, `src/utils/stripHtml.ts` |
| RF04 - Favoritos com Context API | Sim | `src/contexts/FavoritesContext.tsx` |
| RF05 - Tela de favoritos | Sim | `src/screens/FavoritesScreen.tsx` |
| RF06 - Persistência de dados | Sim (local) | `src/services/userData/*`, `src/hooks/useUserCollection.ts` |
| RF07 - Login, sessão e consumidos | Sim (local) | `src/contexts/AuthContext.tsx`, `src/navigation/RootNavigator.tsx`, `src/services/auth/*`, `src/contexts/CapturedContext.tsx` |
| RF08 - Busca | Sim | `src/screens/SearchScreen.tsx` |
| RF09 - Feedback de UI | Sim | `src/hooks/useFetch.ts`, `src/components/ErrorView.tsx`, `src/components/ListFooter.tsx` |
| RF10 - Acessibilidade | Sim (verificada por testes automatizados) | `src/components/*`, `src/theme/index.ts` |

## Seção 4 - Flutter × React Native

Comparamos o nosso app em Flutter (Portal Multiversal, com a API do Rick and Morty) com este app em React Native (DigiDex).

**Estado global (Provider × Context API).** No Flutter usamos o Provider: quando um dado muda, ele avisa as telas que
usam esse dado, e elas se atualizam sozinhas. No React Native usamos o Context API, que faz a mesma coisa, mas para a gente deu mais
trabalho: tivemos que montar o Provider e um hook (`useFavorites`) e tomar cuidado para o app não redesenhar a tela
inteira sem precisar. Achamos o Provider do Flutter mais "pronto".

**Listas (GridView × FlatList).** No Flutter o catálogo usa o `GridView`, e a gente colocou um botão
"Carregar Mais" para ver as próximas páginas. No React Native a `FlatList` permitiu fazer a rolagem infinita de verdade (a
lista carrega mais sozinha quando chega no fim) e o puxar para atualizar, como o enunciado pede. Ficou melhor de usar, mas exigiu mais
cuidado para não pedir a mesma página duas vezes. Outra diferença: no Flutter a busca abria direto o primeiro resultado; aqui ela mostra
uma lista de resultados.

**Assincronismo (FutureBuilder × useEffect/useState).** No Flutter, o `FutureBuilder` já cuida sozinho dos
três momentos: carregando, erro e dados prontos. No React Native isso não vem pronto, então criamos o nosso próprio hook
(`useFetch`) com `useEffect` e `useState`. Deu mais código, mas ficou fácil de entender o que acontece em
cada momento, e ainda conseguimos cancelar o pedido quando a pessoa sai da tela.

**Produtividade e ferramentas (hot reload × Fast Refresh/Expo Go).** Nos dois, o app atualiza rápido enquanto a gente
edita o código, quase sempre sem perder o que estava na tela (é o hot reload no Flutter e o Fast Refresh no React Native). No Flutter
rodamos no Chrome e no emulador do Android. No React Native rodamos no emulador do Android Studio com o Expo, que instala o Expo Go
sozinho, mas precisou de um ajuste no computador (a variável `ANDROID_HOME`). O TypeScript ajudou porque mostra erros de tipo
antes de rodar, parecido com o Dart. No geral, o Flutter pareceu mais "pronto", e o React Native mais flexível, só que com mais código
nosso.

## Seção 5 - Tema da explicação técnica

- **Tema:** Navegação condicional (como o `AuthContext` escolhe entre o Stack de login e o do app, e por
  que não usar `navigation.navigate('Login')` no logout).
- **Minuto no vídeo:** a partir de 6:45 (até o final, 8:44)
- Pontos para o vídeo: `RootNavigator.tsx` (renderização por estado), `AuthContext.tsx` (`isRestoring`),
  `services/auth/*` e `services/userData/*`.

## Seção 6 - Screenshots

Inclua capturas de: **login**, **catálogo**, **detalhes**, **busca**, **favoritos** e **itens consumidos
(capturados)**.

| Tela | Screenshot |
|---|---|
| Login | [imagem] |
| Catálogo | [imagem] |
| Detalhes | [imagem] |
| Busca | [imagem] |
| Favoritos | [imagem] |
| Capturados | [imagem] |

---

### Checklist final (não vai no PDF)
- [ ] Nomes completos na capa (todos) e iguais ao dito no vídeo.
- [ ] Repositório público com README; **sem `.env`** commitado.
- [ ] Vídeo público no YouTube entre 6 e 9 minutos.
- [ ] Todas as seções 1–6 presentes (cada item faltante: −20%).
- [ ] PDF enviado pelo campo oficial até 02/11/2026.
