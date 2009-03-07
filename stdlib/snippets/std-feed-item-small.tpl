<div class="pb-feed-item-small">
  {#if $T.link}
    <div class="pb-feed-item-small-title"><a href="{$T.link}" target="_blank">{$T.title}</a></div>
  {#else}
    <div class="pb-feed-item-small-title">{$T.title}</div>
  {#/if}
</div>