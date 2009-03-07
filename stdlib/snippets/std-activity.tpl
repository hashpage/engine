<div class="activity">
  <div class="icon">
    <a href="{$T.user.profileUrl}?service={$T.service.id}">
      <img src="{$T.service.iconUrl}" alt="{$T.service.name}" class="icon" />
    </a>
  </div>
  <div class="body">
    <div class="summary">
      shared an item on <a href="{$T.service.profileUrl}">{$T.service.name}</a>
    </div>
    <div class="link">
      <a href="{$T.link}" class="main">{$T.title}</a>
    </div>
    {#if $T.media && $T.media.length>0}
    <div class="media">
      <table border="0" cellspacing="0" cellpadding="0">
        <tr>
          {#foreach $T.media as medium}
            <td>{#include medium root=$T.medium}</td>
          {#/for}
        </tr>
      </table>
    </div>
    {#/if}
    <div class="info">
      {humane_date($T.updated)}
    </div>
    <div class="comments">
      {#foreach $T.comments as comment}
        {#include comment root=$T.comment}
      {#/for}
    </div>
  </div>
</div>