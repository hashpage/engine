<div class="blogpost">
  {#if $T.link}
  <h2><a href="{$T.link}" target="_blank">{$T.title}</a></h2>
  {#else}
  <h2>{$T.title}</h2>
  {#/if}
  {#if $T.content}
  <div>
    {$T.content}
  </div>  
  {#/if}
</div>