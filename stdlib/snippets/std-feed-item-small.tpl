<div class="hp-feed-item-small">
  {#if $T.link}
    <div class="hp-feed-item-small-title"><a href="{$T.link}" target="_blank">{$T.title}</a></div>
  {#else}
    <div class="hp-feed-item-small-title">{$T.title}</div>
  {#/if}
</div>