<div class="pb-feed-item">
  {#if $T.link}
    <h2 class="pb-feed-item-title"><a href="{$T.link}" target="_blank">{$T.title}</a></h2>
  {#else}
    <h2 class="pb-feed-item-title">{$T.title}</h2>
  {#/if}
  {#if $T.content}
    <div class="pb-feed-item-content">
      {$T.content}
    </div>
  {#/if}
</div>