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

- Reuse the sales composition form for post-save comparisons; comparison writes must only update the kit reference, never sale totals or payments.
- Run stock and supplier purchases atomically through the authenticated processar_compra_estoque_venda RPC, guarded per sale; only an explicit sale confirmation enables processing.
