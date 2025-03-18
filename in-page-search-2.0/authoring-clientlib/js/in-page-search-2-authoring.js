$(document).on("dialog-ready, foundation-contentloaded", function () {
    $("label:contains('*')").each(function()
    {
         var labelAstrick=$(this).text();
         $(this).text(labelAstrick.replace(' *',''));
    });

    var $checkbox=$("input[name='./enableFeaturedArticles']");
var $title=$("input[name='./featuredArticlesSectionTitle']").closest(".coral-Form-fieldwrapper");
 var $dropdownOne=$("select[name='./featuredArticlesFeedType']").closest(".coral-Form-fieldwrapper");
 var $pathpickerOne=$("input[name='./pathOneArticle']").closest(".coral-Form-fieldwrapper");
  var $pathpickerTwo=$("input[name='./pathTwoArticle']").closest(".coral-Form-fieldwrapper");
 var $pathpickerThree=$("input[name='./pathThreeArticle']").closest(".coral-Form-fieldwrapper");
 var $pathpickerFour=$("input[name='./pathFourArticle']").closest(".coral-Form-fieldwrapper");
if(!$checkbox.is(":checked"))
{
   $title.hide();
   $dropdownOne.hide();
   $pathpickerOne.hide();
   $pathpickerTwo.hide();
   $pathpickerThree.hide();
   $pathpickerFour.hide();
}
else
{
    $title.show();
    $dropdownOne.show();
    $pathpickerOne.show();
    $pathpickerTwo.show();
    $pathpickerThree.show();
    $pathpickerFour.show();
}
$checkbox.on("change",function()
{

    if($(this).is(":checked"))
    {
        $title.show();
    $dropdownOne.show();
    $pathpickerOne.show();
    $pathpickerTwo.show();
    $pathpickerThree.show();
    $pathpickerFour.show();
    }
    else
    {
         $title.hide();
   $dropdownOne.hide();
   $pathpickerOne.hide();
   $pathpickerTwo.hide();
   $pathpickerThree.hide();
   $pathpickerFour.hide();
    }
})
var $disableSearchCheckbox=$("input[name='./disableSearch']");
var $searchText=$("input[name='./newsText']").closest(".coral-Form-fieldwrapper");
if(!$disableSearchCheckbox.is(":checked"))
{
   $searchText.show();
}
else
{
    $searchText.hide();
}
$disableSearchCheckbox.on("change",function()
{

    if($(this).is(":checked"))
    {
        $searchText.hide();
    }
    else
    {
          $searchText.show();
    }
})
});