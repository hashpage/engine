<div class="paginator">
  {#if $T.more==true}
    <a href="javascript: {$P.self}.onNext();">more...</a>
  {#else}
    <a href="javascript: {$P.self}.onReset()">no more data, go back to first page</a>
  {#/if}
</div>