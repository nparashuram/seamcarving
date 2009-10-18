/**
 * This is the basic function that replaces 
 * the Image tags with the Canvas Tags
 */
var SeamUtil = 
{
	init : function()
	{
		var img = document.getElementById("demoImage");
		var demoCanvas = document.getElementById("demoCanvas");

		demoCanvas.height = img.height;
		demoCanvas.width = img.width;
		
		SeamUtil.axe = new ImageResizer(img.src, demoCanvas);

	},
	
	getStyle : function (el, cssproperty, csspropertyNS)
	{
		if (typeof(csspropertyNS) == "undefined")
		{
			csspropertyNS = cssproperty;
		}
		
		if (el.currentStyle)
		{
			 //if IE5+
			return el.currentStyle[cssproperty]
		}
		else if (window.getComputedStyle)
		{
			 //if NS6+
			var elstyle=window.getComputedStyle(el, "");
			return elstyle.getPropertyValue(csspropertyNS);
		}
	},

	reduceWidth : function(widthDiff)
	{
		SeamUtil.axe.resizeReduce(widthDiff);
		//SeamUtil.axe.canvasDiv.width = SeamUtil.axe.canvasDiv.width - widthDiff;
	}
}

SeamUtil.init();