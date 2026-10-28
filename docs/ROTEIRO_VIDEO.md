# Roteiro do vídeo (6 a 9 minutos · YouTube público)

Alvo: **≈ 7min30**. Menos de 6 ou mais de 9 minutos desconta 5% por minuto fora do intervalo.
Todos aparecem e falam; cada um explica ao menos uma parte que implementou.
Integrantes: Caetano Padoin, Rafael Gabardo, Matheus Brehm e Davi Henrique. Os blocos abaixo (1 a 4) seguem os lotes de commits;
cada um deve explicar uma parte que realmente conhece.

## 0:00–0:30 — Apresentação
Cada integrante diz o **nome completo** (igual ao da capa do PDF), um de cada vez.

## 0:30–2:00 — Demonstração (app rodando no celular ou emulador)
1. Tela de login → **criar conta** → entra direto no catálogo.
2. **Catálogo** em grade; rolar até o fim para mostrar a **rolagem infinita** (spinner no rodapé); puxar para
   atualizar (pull-to-refresh).
3. **Busca**: digitar "agu", tocar em **Buscar** → lista de resultados; filtrar por nível; buscar algo sem
   resultado para mostrar a mensagem.
4. Abrir **detalhes** (título do header muda para o nome); **favoritar** (coração); marcar como **capturado** e
   dar uma **nota**.
5. Abas **Favoritos** e **Capturados** (mostrar o estado vazio se der).
6. **Fechar o app e reabrir**: continua logado, favoritos e capturados preservados.
7. (Opcional, 5 s) desligar a internet e mostrar a mensagem de erro com "Tentar novamente".

## 2:00–5:30 — Explicação do código (~50 s por pessoa, relacionando ao RF)

Cada bloco abaixo corresponde a um **lote de commits** (Lote 1 a 4): quem enviou o lote ao GitHub explica o bloco.

### Bloco 1 (Lote 1) — Fundação: API, HTML limpo e armazenamento (RF03, RF06, RF07)
- `digimonService.ts`: Axios, páginas começando em 0, busca sem resultado volta sem a chave `content` (tratada como lista
  vazia), erro 400 vira "não encontrado" e `toFriendlyError` gera as mensagens amigáveis do RF09.
- Se perguntarem por que a descrição está em inglês: a Digi-API só oferece inglês e japonês, então `pickDescription`
  escolhe o inglês; toda a interface do app está em português.
- `stripHtml.ts` (RF03: HTML exibido sem tags), `storage.ts` (AsyncStorage × SecureStore) e `hash.ts`
  (sal + SHA-256: a senha nunca é guardada em texto puro).

### Bloco 2 (Lote 2) — Persistência, sessão e estado global (RF04, RF06, RF07)
- `FavoritesContext.tsx`: `createContext` + Provider + `useFavorites`, o `Set` de ids e a escrita otimista.
- `useUserCollection.ts`: hidratação em `useEffect` com `cancelled`; `mutate` salva e desfaz se falhar.
- `UserDataRepository` com `LocalUserDataRepository` (AsyncStorage) e `FirestoreUserDataRepository` (nuvem);
  `AuthContext.tsx` com `LocalAuthService.ts`; `backend.ts` é o único ponto que escolhe local × nuvem pelo `.env`.

### Bloco 3 (Lote 3) — Telas e componentes (RF01, RF05, RF08, RF09, RF10)
- `CatalogScreen.tsx` + `usePaginatedList.ts`: `FlatList` com `numColumns`, `onEndReached` + `onEndReachedThreshold`,
  `refreshing/onRefresh`, `ListFooterComponent`; um estado único com a "fase" da lista (`initial`, `refresh`, `more`).
- `SearchScreen.tsx` (`TextInput` controlado, botão "Buscar", lista de resultados) e `DetailsScreen.tsx`
  (`route.params.id`, `navigation.setOptions`, `useFetch`).
- Acessibilidade: `FavoriteButton` (rótulo muda + `accessibilityState`), `IconButton` (44×44 + `hitSlop`),
  contraste em `theme/index.ts`. Mostrar o TalkBack lendo o coração, se possível.

### Bloco 4 (Lote 4) — Navegação condicional e login (RF02, RF07)
- `RootNavigator.tsx`: renderiza `AuthStack` ou `AppStack` conforme o `user` do `AuthContext`; `HydrationGate`
  evita mostrar listas "zeradas".
- `AppStack.tsx` (native-stack com Detalhes), `AppTabs.tsx`, `LogoutButton.tsx`, `AuthForm.tsx` e `App.tsx`.

## 5:30–8:00 — Explicação técnica (todo o grupo)

**Tema: Navegação condicional.**

1. *Como funciona* (`RootNavigator.tsx`): o `AuthContext` guarda `user`; o `RootNavigator` renderiza
   `AuthStack` **ou** `AppStack`. No logout só limpamos o estado, e a troca de Stack é automática.
2. *Por que **não** usar `navigation.navigate('Login')` no logout*: deixaria as telas protegidas na pilha (o botão
   "voltar" as reabriria) e duplicaria a regra de quem pode ver o quê. Mostrar o código lado a lado.
3. *Sessão restaurada*: o `isRestoring` do `AuthContext` evita o "flash" da tela de login ao abrir o app já
   logado, e o `HydrationGate` evita mostrar listas "zeradas" antes de carregar os dados do usuário.
4. *Ligação com o resto do app*: `AuthContext` usa a interface `AuthService` (hoje com `LocalAuthService`), e
   os dados do usuário passam por `UserDataRepository` (hoje com `LocalUserDataRepository`); a troca de usuário
   recarrega favoritos e capturados. Mostrar: criar conta, sair, entrar com outra conta e ver listas diferentes.

## Checklist antes de gravar
- [ ] App rodando com os dados que vão aparecer (conta criada, alguns favoritos/capturados para a reabertura).
- [ ] Cronometrar: 0:30 · 2:00 · 5:30 · 8:00 (tolerância pequena, total entre 6:00 e 9:00).
- [ ] Todos aparecem e falam; cada um cita o RF do trecho que explica.
- [ ] Vídeo **público** no YouTube e link colado no README e no PDF.
