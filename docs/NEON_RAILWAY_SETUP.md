# Neon + Railway – Setup Tubarão BJJ

## 1. Neon (já feito)

- Projeto: **TubaraoBJJ**
- Branch: **production**
- Database: **neondb**
- Role: **neondb_owner**
- Connection pooling: **on**
- Host (pooler): `ep-wild-sunset-acepaue4-pooler.sa-east-1.aws.neon.tech`

## 2. Obter a connection string completa

1. No Neon, abra **Connect to your database** (como na imagem).
2. Clique em **Show password** e copie a **connection string** completa (inclui a senha).
3. Ela deve ser no formato:
   `postgresql://neondb_owner:SuaSenhaAqui@ep-wild-sunset-acepaue4-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require`

## 3. Configurar no Railway

- Projeto Railway: **tubaraobjj-api** → serviço **api** → **Variables**.
- Defina **DATABASE_URL** = a connection string completa copiada do Neon (com a senha revelada).
- Salve; o Railway fará redeploy e o start rodará `db:setup` (tabelas + usuário admin no Neon).

## 4. Opcional: via CLI

Na pasta `backend` (com Railway linkado):

```bash
railway variable set -s api DATABASE_URL='postgresql://neondb_owner:SUA_SENHA_NEON@ep-wild-sunset-acepaue4-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
```

Substitua `SUA_SENHA_NEON` pela senha real (ou cole a URL inteira copiada do Neon).
