<li id="{fbid}" class="frmb-group">
  <h4>{label}</h4>
  <label for="{fbid}_label">Étiquette du champs:</label>
  <input type="text" value="{model.label}" placeholder="ex: Prénom" name="{fbid}_label" id="{fbid}_label" required>
  <label for="{fbid}_required">Requis?</label>
  <input type="checkbox" value="1" {?model.required}checked="checked"{/model.required} name="{fbid}_required" id="{fbid}_required">
  <a href="#" class="frmb-remove">Retirer</a>
  {?allowsChoices}
  <a href="#" class="frmb-add-choice">Ajouter un choix</a>
  <ul class="frmb-choices">
  </ul>
  {/allowsChoices}
</li>
