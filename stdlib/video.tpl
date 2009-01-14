<div class="media-container {$T.type}">
  {#if $T.thumbnails && $T.thumbnails.length}
  <a href="{$T.link}" play="{$T.playbackUrl}" type="{$T.playerType}">
    <img class="thumbnail" title="{$T.title}" src="{$T.thumbnails[0].url}" width="130" height="97">
  </a>
  {#/if}
</div>
