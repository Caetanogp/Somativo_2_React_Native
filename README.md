# DigiDex — Catálogo interativo de Digimon (React Native + Expo)

Projeto Somativo de **Mobile Development: Framework** (BSI) · React Native + Expo + TypeScript.
Aplicativo que consome a [Digi-API](https://digi-api.com) (pública, gratuita, sem chave) com login,
catálogo com rolagem infinita, busca, detalhes, favoritos, "capturados" com nota de 1 a 5 e
persistência local **ou** na nuvem (Firebase).

## Integrantes

| Nome completo |
|---|
| Caetano Padoin |
| Rafael Gabardo |
| Matheus Brehm |
| Davi Henrique |

Vídeo de apresentação: [https://youtu.be/ILyOg3Uxkkk](https://youtu.be/ILyOg3Uxkkk)

## Como rodar

Requisitos: Node.js 20+, e o app **Expo Go** no celular (ou um emulador Android/iOS).

```bash
npm install
npx expo start          # escaneie o QR code com o Expo Go
```

Por padrão o app roda **100% local** (nenhuma configuração necessária): cadastro e login salvos no
aparelho (senha com sal + hash SHA-256, sessão no SecureStore) e favoritos/capturados no AsyncStorage.

### Opcional: nuvem com Firebase (bônus de persistência e autenticação real)

1. No [console do Firebase](https://console.firebase.google.com), crie um projeto e registre um app **Web**.
2. Ative **Authentication → Sign-in method → E-mail/senha**.
3. Crie um banco **Firestore** e publique as regras de [`firestore.rules`](firestore.rules)
   (cada usuário só acessa `users/{seu uid}`).
4. Copie `.env.example` para `.env` e preencha as seis variáveis `EXPO_PUBLIC_FIREBASE_*`.
5. Reinicie com `npx expo start --clear`. A tela de login passa a mostrar **"Modo: Nuvem (Firebase)"**.

> O arquivo `.env` está no `.gitignore` e **nunca** deve ser commitado.

## Funcionalidades × requisitos

| RF | O que faz | Arquivo principal |
|---|---|---|
| RF01 | Catálogo em grade (`FlatList` + `numColumns`), rolagem infinita (`onEndReached`), pull-to-refresh, placeholder sem imagem, `keyExtractor` estável | [`CatalogScreen.tsx`](src/screens/CatalogScreen.tsx), [`usePaginatedList.ts`](src/hooks/usePaginatedList.ts), [`ItemCard.tsx`](src/components/ItemCard.tsx) |
| RF02 | React Navigation (native-stack), `id` por `route.params`, título via `navigation.setOptions` | [`navigation/`](src/navigation), [`DetailsScreen.tsx`](src/screens/DetailsScreen.tsx) |
| RF03 | Detalhes por segunda requisição Axios; HTML da API exibido sem tags | [`DetailsScreen.tsx`](src/screens/DetailsScreen.tsx), [`stripHtml.ts`](src/utils/stripHtml.ts) |
| RF04 | Favoritos com Context API (`createContext` + Provider + `useFavorites`), coração igual no card e no detalhe | [`FavoritesContext.tsx`](src/contexts/FavoritesContext.tsx) |
| RF05 | Tela de favoritos com `ListEmptyComponent` | [`FavoritesScreen.tsx`](src/screens/FavoritesScreen.tsx) |
| RF06 | Persistência local (AsyncStorage) e em nuvem (Firestore); carga em `useEffect` sem mostrar dados zerados | [`services/userData/`](src/services/userData), [`useUserCollection.ts`](src/hooks/useUserCollection.ts) |
| RF07 | Login/cadastro, navegação condicional, sessão persistente, logout, "capturados" com nota | [`AuthContext.tsx`](src/contexts/AuthContext.tsx), [`RootNavigator.tsx`](src/navigation/RootNavigator.tsx), [`services/auth/`](src/services/auth), [`CapturedContext.tsx`](src/contexts/CapturedContext.tsx) |
| RF08 | `TextInput` controlado + botão "Buscar" → lista de resultados, filtro por nível, mensagem sem resultados | [`SearchScreen.tsx`](src/screens/SearchScreen.tsx) |
| RF09 | `ActivityIndicator` em todas as requisições, erro amigável com "Tentar novamente", estados loading/error/data explícitos | [`useFetch.ts`](src/hooks/useFetch.ts), [`ErrorView.tsx`](src/components/ErrorView.tsx), [`ListFooter.tsx`](src/components/ListFooter.tsx) |
| RF10 | `accessibilityLabel/Role/State`, contraste calculado, toque ≥ 44 pt, fonte do sistema respeitada | [`components/`](src/components), [`theme/index.ts`](src/theme/index.ts) |

### Acessibilidade (RF10) em detalhe
- Imagens: `accessibilityRole="image"` + rótulo ("Imagem de Agumon"; "… (imagem indisponível)" no placeholder).
- Botões de estado (favoritar, capturado, chips de nível, estrelas) usam `accessibilityState={{ selected }}`
  e, no coração, o rótulo também muda ("Adicionar … aos favoritos" / "Remover … dos favoritos").
- O coração é irmão do botão do card (não filho), então leitores de tela tratam as duas ações separadamente.
- Todas as áreas tocáveis têm no mínimo 44×44 pt (`MIN_TOUCH`) mais `hitSlop`.
- Nenhum texto usa `allowFontScaling={false}` nem altura fixa; botões e campos usam `minHeight`.
- Contraste (WCAG) calculado e documentado em [`theme/index.ts`](src/theme/index.ts): todo texto passa de 4,5:1.

## Arquitetura

```
src/
  config/        env.ts (lê EXPO_PUBLIC_*), firebase.ts (inicialização única)
  services/      api.ts, digimonService.ts (Axios), storage.ts, backend.ts (escolhe local × nuvem)
    auth/        AuthService (interface) · LocalAuthService · FirebaseAuthService
    userData/    UserDataRepository (interface) · LocalUserDataRepository · FirestoreUserDataRepository
  contexts/      AuthContext · FavoritesContext · CapturedContext
  hooks/         useFetch · usePaginatedList · useUserCollection · useCardActions · useOpenDetails
  components/    ItemCard, RemoteImage, IconButton, FavoriteButton, StarRating, LevelChips, ErrorView, ...
  screens/       Login, Register, Catalog, Search, Details, Favorites, Captured (+ subpastas details/ e search/)
  navigation/    RootNavigator (condicional), AuthStack, AppStack, AppTabs
  theme/ · utils/ · types/
```

Decisões principais:
- **Interfaces `AuthService` e `UserDataRepository`**: local e Firebase são intercambiáveis; os contexts não
  sabem qual está em uso, e `services/backend.ts` é o único ponto que decide, conforme o `.env`.
- **Navegação condicional**: o `RootNavigator` renderiza `AuthStack` ou `AppStack` conforme `user` no
  `AuthContext`. Login e logout só mudam esse estado; nunca se chama `navigation.navigate('Login')`.
- **Escrita otimista**: favoritar/capturar atualiza a tela na hora e reverte (com alerta) se salvar falhar.
- **`usePaginatedList`**: uma requisição por vez, respostas obsoletas descartadas, `AbortController` no cleanup,
  deduplicação por `id` e erro de "próxima página" sem perder os itens já carregados.

### Particularidades da Digi-API tratadas
- Páginas começam em **0**; busca sem resultado devolve a resposta **sem a chave `content`**;
  id inexistente responde **HTTP 400** (vira "Digimon não encontrado.").

## Testes e verificação

```bash
npm test               # Jest: 93 testes (serviços, hooks, contexts, componentes e o app completo)
npm run typecheck      # tsc --noEmit
npx expo-doctor        # diagnóstico de dependências e configuração
npx expo export --platform android   # confirma que o bundle compila
```

O teste `__tests__/app.integration.test.tsx` renderiza o app inteiro (cadastro → catálogo → favoritar →
detalhes → capturar → busca → reabrir o app → logout) com a API simulada.

## Segurança

- Senhas nunca são guardadas em texto puro (sal aleatório + SHA-256); a sessão local fica no SecureStore.
- Chaves do Firebase só em `.env` (ignorado pelo git); `.env.example` não tem segredos.
- `firestore.rules` restringe cada usuário aos próprios documentos.
