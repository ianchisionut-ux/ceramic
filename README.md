# Ceramic-evo shop - pachet backend

Acest pachet contine fundatia pentru catalog, cos, comenzi, conturi de client
si plata online, gata de integrat intr-un proiect Next.js 16 (App Router)
+ TypeScript + Prisma + PostgreSQL, in stilul proiectului PMCUSTOMS.

## Structura

```
schema.prisma                              modelele: User, Address, Category,
                                            Product, ProductVariant, Cart, Order...
prisma/seed.ts                             categorii + produse reale de test
auth.ts                                    config NextAuth (login email+parola)
lib/prisma.ts                              Prisma Client singleton
lib/cart.ts                                cos user logat / cos guest (cookie)
lib/password.ts                            hash/verificare parola (bcrypt)
lib/stripe.ts                              client Stripe
lib/admin-guard.ts                         verifica rol ADMIN pentru pagini/API admin

API public
app/api/cart/route.ts                      GET continut cos, POST adauga produs
app/api/cart/[itemId]/route.ts             PATCH cantitate, DELETE elimina
app/api/checkout/route.ts                  creeaza comanda + porneste plata
app/api/auth/[...nextauth]/route.ts        handler NextAuth
app/api/auth/register/route.ts             creare cont nou
app/api/webhooks/stripe/route.ts           confirmare plata din Stripe

Pagini frontend
app/produse/page.tsx                       catalog cu filtrare pe categorie (SEO)
app/produse/[slug]/page.tsx                pagina de produs + schema.org + calculator mp-cutii
app/cos/page.tsx                           cos de cumparaturi
app/checkout/page.tsx                      formular finalizare comanda
components/ProductAddToCart.tsx            client component - selector varianta + adauga in cos

Admin dashboard
app/admin/produse/page.tsx                 lista produse cu stoc
app/admin/produse/nou/page.tsx             formular produs nou
app/admin/produse/[id]/page.tsx            editare produs + stoc/pret pe varianta
app/admin/comenzi/page.tsx                 inbox comenzi cu schimbare status
components/OrderStatusSelect.tsx           dropdown schimbare status comanda
app/api/admin/products/route.ts            GET/POST produse (protejat ADMIN)
app/api/admin/products/[id]/route.ts       PATCH/DELETE produs
app/api/admin/variants/[id]/route.ts       PATCH stoc/pret varianta
app/api/admin/orders/[id]/route.ts         PATCH status comanda

Autentificare si cont
app/cont/login/page.tsx                    autentificare cu email + parola
app/cont/inregistrare/page.tsx             creare cont nou
app/cont/page.tsx                          panou cont - istoric comenzi, adrese
app/comanda/succes/page.tsx                confirmare dupa finalizarea comenzii
components/Header.tsx                      header cu logo, navigatie, cos, cont
app/layout.tsx                             layout radacina (imbina cu cel existent, nu suprascrie)
public/logo.jpg                            logo-ul gresie.

.env.example                               variabile de mediu necesare
```

## Pasi de instalare

1. Copiaza fisierele in radacina proiectului tau Next.js, pastrand structura
   de foldere (`app/api/...`, `lib/...`, `prisma/...`).

2. Instaleaza pachetele:
   ```
   npm install @prisma/client next-auth@beta bcryptjs resend stripe
   npm install -D prisma @types/bcryptjs
   ```

3. Copiaza `.env.example` in `.env` si completeaza valorile (DATABASE_URL
   de la Neon, RESEND_API_KEY, cheile Stripe).

4. Genereaza baza de date si clientul Prisma:
   ```
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   Daca `db seed` nu porneste automat, adauga in package.json:
   ```json
   "prisma": { "seed": "ts-node prisma/seed.ts" }
   ```

5. Pentru Stripe local, foloseste Stripe CLI pentru webhook:
   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

6. Ruleaza proiectul:
   ```
   npm run dev
   ```

## Ce mai trebuie facut manual

- **`app/layout.tsx`** inclus aici e un starter minimal - daca ai deja
  un layout in proiect, imbina doar `<Header />` si linkul catre
  Tabler icons, nu suprascrie fisierul existent
- **Primul cont admin** - nu exista seed pentru asta; te inregistrezi
  normal prin `/cont/inregistrare`, apoi schimbi manual `role` in
  `ADMIN` din `npx prisma studio`
- **Stilizare** - paginile au CSS inline minimal, schelet functional;
  poti extinde design-ul pornind de la `components/Header.tsx` si
  wordmark-ul `gresie.` din logo
- Daca preferi un procesator romanesc in loc de Stripe: Netopia sau
  EuPlatesc - structura din `app/api/checkout/route.ts` ramane aceeasi,
  se schimba doar apelul catre SDK-ul lor si webhook-ul de confirmare

## Nota despre stoc si concurenta

Verificarea de stoc din `checkout/route.ts` e facuta inainte de a crea
comanda, dar la trafic mare exista o fereastra scurta de race condition
intre doi clienti care cumpara ultimele cutii simultan. Pentru volum mare
de vanzari, ia in calcul sa adaugi un lock optimist (camp `version` pe
`ProductVariant`, actualizat cu verificare in tranzactie) sau o coada
(ex: queue in Redis) la finalizarea comenzii.
