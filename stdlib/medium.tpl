{#if $T.type=="video"}
  {#include video root=$T}
{#elseif $T.type=="picture"}
  {#include picture root=$T}
{#else}
  unknown media type
{#/if}
