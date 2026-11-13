# How to use

1. Run `npm start` and open http://localhost:3000.
2. Fill in headline, offer, button text, pick a brand color, optionally add an image.
3. Check the four previews. Fix any red errors or orange warnings.
4. Download PNG or HTML for each size.
5. Save the setup as a template to reuse it later.

## Interview talking points
- Problem: manual resizing is slow and off-brand risk is high. Solution: one input, four sizes, brand rules enforced.
- Client side: Canvas rendering shared by preview and PNG export, so what you see is what you download.
- Server side: small REST API with input sanitising, body size limit and path traversal protection.
- Quality: unit tests, accessible form, contrast check.
- Result to claim (measure it yourself): time to produce 4 sizes by hand vs with the tool.
