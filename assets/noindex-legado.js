/* Endereços antigos de quem usava o domínio antes (?pid=, ?m2/... etc.): não indexar.
   Parâmetros de campanha (utm_, fbclid, gclid, igshid, si) continuam normais. */
(function(){var q=location.search.slice(1);if(!q)return;var p=q.split("&").filter(function(x){return x&&!/^(utm_[a-z]+|fbclid|gclid|igshid|si)=/i.test(x)});if(p.length){var m=document.createElement("meta");m.name="robots";m.content="noindex";document.head.appendChild(m);}})();
