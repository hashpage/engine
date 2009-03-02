<div class="media-container {$T.type}">
  {#if $T.thumbnails && $T.thumbnails.length}
  <a href="{$T.link}" target="_blank" class="picture-link" rel="group-{$P.widget.guid}">
    <img class="thumbnail" rel="all" title="{$T.title}" src="{$T.thumbnails[0].url}" width="30" height="30">
  </a>
  {#/if}
</div>