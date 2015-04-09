# Handle limits min and max (I can't drag beyond or above the fold)
# Fix anim delay when release the drag

# This imports all the layers for "goto-2-c" into goto2CLayers1
mock = Framer.Importer.load "imported/goto-2-c"

Framer.Device.deviceType = "applewatchsport-38-aluminum-sportband-white"

mock["watchModal"].opacity = 0
mock["targetIco"].rotationZ = -30
mock["glance"].draggable.enabled = true
mock["glance"].draggable.speedX = 0
# Adding a draggable empty space at the top so the glance can be dragged even when outside of the watch
naturalPadding = 36
fakePadding = 80
mock["glance"].height = 340 + fakePadding
mock["glance"].width = 272
mock["glance"].centerX()
mock["glance"].y = 310
mock["glance"].style["padding-top"] = fakePadding + "px"
mock["glance"].style["padding-left"] = "59px"
mock["glance"].style["margin-top"] = "-" + (fakePadding - naturalPadding) + "px"
# mock["glance"].backgroundColor = "red"

isGlance = false

progress = (current, start, end) ->
	progressValue = 0
	if current >= end
		progressValue = 1
	else if current <= start
		progressValue = 0
	else
		ratio = end - start
		progressValue = 1 / (ratio / current)
	return progressValue

toggleGlance = (reverse) ->
	animationSpeed = 0.15
	animationCurve = "spring(200, 22, 10)"
	if isGlance and reverse
		showGlance(animationSpeed, animationCurve)
	else if isGlance and not reverse
		hideGlance(animationSpeed, animationCurve)
	else if not isGlance and reverse
		hideGlance(animationSpeed, animationCurve)
	else
		showGlance(animationSpeed, animationCurve)

showGlance = (animationSpeed, animationCurve) ->
	mock["watchModal"].animate({properties:{opacity: 1}, time: animationSpeed, curve: animationCurve})
	mock["glance"].animate({properties:{y: 0}, time: animationSpeed, curve: animationCurve})
	mock["watchFace"].animate({properties:{blur: 15}, time: animationSpeed, curve: animationCurve})
	isGlance = true
	
hideGlance = (animationSpeed, animationCurve) ->
	mock["watchModal"].animate({properties:{opacity: 0}, time: animationSpeed, curve: animationCurve})
	mock["glance"].animate({properties:{y: 310}, time: animationSpeed, curve: animationCurve})
	mock["watchFace"].animate({properties:{blur: 0}, time: animationSpeed, curve: animationCurve})
	isGlance = false

handleGlanceDraggingStart = (event, layer) ->
# 	mock["glance"].draggable.speedY = 1
	mock["targetIco"].animate({properties: {rotationZ: mock["targetIco"].rotationZ + 10}, time: 0.3, curve: "spring"})
	layer.initY = layer.y

handleGlanceDraggingMove = (event, layer) ->
	distance = Math.abs(layer.y - layer.initY)
	relativeDistance = progress(distance, 0, 340)
	if isGlance
		mock["watchModal"].opacity = 1 - (1 * relativeDistance)
		mock["watchFace"].blur = 15 - (15 * relativeDistance)
	else
		mock["watchModal"].opacity = 1 * relativeDistance
		mock["watchFace"].blur = 15 * relativeDistance
# 	if mock["glance"].y <= 310 and mock["glance"].y >= 0
# 		distance = Math.abs(layer.y - layer.initY)
# 		relativeDistance = progress(distance, 0, 340)
# 		if isGlance
# 			mock["watchModal"].opacity = 1 - (1 * relativeDistance)
# 			mock["watchFace"].blur = 15 - (15 * relativeDistance)
# 		else
# 			mock["watchModal"].opacity = 1 * relativeDistance
# 			mock["watchFace"].blur = 15 * relativeDistance
# 	else
# 		mock["glance"].y = mock["glance"].y
# 		mock["glance"].draggable.speedY = 0

handleGlanceDraggingEnd = (event, layer) ->
	mock["targetIco"].animate({properties: {rotationZ: mock["targetIco"].rotationZ - 10}, time: 0.3, curve: "spring"})
	distance = Math.abs(layer.y - layer.initY)
	if distance > 90
		toggleGlance(false)
	else
		toggleGlance(true)

handleClick = () ->
	toggleGlance(false)

# mock["watchFace"].on(Events.Click, handleClick)
mock["glance"].on(Events.DragStart, handleGlanceDraggingStart)
mock["glance"].on(Events.DragMove, handleGlanceDraggingMove)
mock["glance"].on(Events.DragEnd, handleGlanceDraggingEnd)