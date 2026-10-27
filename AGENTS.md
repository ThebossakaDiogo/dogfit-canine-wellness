<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Signed-in pages live under the `_authenticated` pathless layout, which redirects anyone without a confirmed email to /auth; why: the PRD requires email approval before any access.
- Recipe content is static in `src/lib/recipes.ts` until a reviewed catalog exists; why: content must be approved before it goes in the database.
