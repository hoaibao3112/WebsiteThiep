# Tu dong test va review PR

## Hanh vi

- Moi lan push len bat ky nhanh nao: chay backend test/typecheck/build va frontend test/build.
- Mo, cap nhat commit, mo lai PR hoac chuyen PR sang ready: chay lai CI va Claude review.
- Commit chi o may local chua kich hoat GitHub Actions. Mot push nhieu commit kiem tra
  trang thai moi nhat; khong chay rieng tung commit trung gian.
- Run cu cung workflow/event/nhanh bi huy khi co run moi. Push va PR co run rieng.
- Backend giu PostgreSQL/Redis rieng tren runner. Cac integration test hien tai chu yeu
  kiem tra contract bang mock; khong phai bang chung da test migration tren database that.
- Claude nhan xet bang tieng Viet, ghi SHA da review, khong tu sua code hay merge.
- PR tu fork va Dependabot van chay CI; AI review duoc bo qua vi khong co secret.

## Kich hoat

1. Commit va push cac workflow trong `.github/workflows/` len GitHub.
2. Trong Settings > Actions > General, cho phep GitHub Actions va action
   `anthropics/claude-code-action` neu repository co allowlist.
3. Trong Settings > Secrets and variables > Actions, tao secret `ANTHROPIC_API_KEY`.
   Khong dua key vao source code, PR hay chat. API review phat sinh phi Anthropic.
4. Cai [Claude GitHub App](https://github.com/apps/claude) cho repository theo
   [huong dan chinh thuc](https://github.com/anthropics/claude-code-action/blob/main/docs/setup.md).
   Workflow cap `id-token: write` de action xac thuc voi App, cung quyen doc source
   va ghi nhan xet PR.
5. Mo PR thu, sau do push them mot commit. Xac nhan ca hai lan CI chay va co comment
   review cho SHA moi. Thieu API key se lam check review bao loi ro rang.

Co the chay thu hai workflow CI bang nut Run workflow sau khi file nam tren nhanh mac dinh.
Khong co credentials/admin GitHub duoc xac minh trong phien cai dat local nay.

## Chan merge khi test hong (tuy chon)

Sau run dau tien, vao Settings > Rules > Rulesets (hoac branch protection), bat
Require status checks to pass va chon `Backend Test & Build`, `Frontend Test & Build`.
Neu doi ten check, cap nhat ruleset dang tham chieu ten cu.
Khong bat buoc `Claude PR Review` neu can nhan PR tu fork/Dependabot.
Check Claude thanh cong chi cho biet review da chay, khong co nghia code khong co loi.

## Chay local

```powershell
cd be
npm ci
npm run prisma:generate
npm test
npm run test:integration
npm run build
cd ../fe
npm ci
npm test -- --maxWorkers=2
npm run build
```

## Tai lieu

- [GitHub workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Claude automatic PR review](https://github.com/anthropics/claude-code-action/blob/main/docs/solutions.md#automatic-pr-code-review)

Rollback: revert cac thay doi workflow va bo required checks tuong ung neu da bat.
