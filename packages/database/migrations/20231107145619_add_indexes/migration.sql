-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_environmentId_idx" ON "ApiKey"("environmentId");

-- CreateIndex
CREATE INDEX "AttributeClass_environmentId_idx" ON "AttributeClass"("environmentId");

-- CreateIndex
CREATE INDEX "Display_formId_idx" ON "Display"("formId");

-- CreateIndex
CREATE INDEX "Display_personId_idx" ON "Display"("personId");

-- CreateIndex
CREATE INDEX "Environment_productId_idx" ON "Environment"("productId");

-- CreateIndex
CREATE INDEX "Integration_environmentId_idx" ON "Integration"("environmentId");

-- CreateIndex
CREATE INDEX "Invite_teamId_idx" ON "Invite"("teamId");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_teamId_idx" ON "Membership"("teamId");

-- CreateIndex
CREATE INDEX "Person_environmentId_idx" ON "Person"("environmentId");

-- CreateIndex
CREATE INDEX "Product_teamId_idx" ON "Product"("teamId");

-- CreateIndex
CREATE INDEX "Response_formId_created_at_idx" ON "Response"("formId", "created_at");

-- CreateIndex
CREATE INDEX "Response_formId_idx" ON "Response"("formId");

-- CreateIndex
CREATE INDEX "ResponseNote_responseId_idx" ON "ResponseNote"("responseId");

-- CreateIndex
CREATE INDEX "form_environmentId_idx" ON "Form"("environmentId");

-- CreateIndex
CREATE INDEX "formAttributeFilter_formId_idx" ON "FormAttributeFilter"("formId");

-- CreateIndex
CREATE INDEX "formAttributeFilter_attributeClassId_idx" ON "FormAttributeFilter"("attributeClassId");

-- CreateIndex
CREATE INDEX "formTrigger_formId_idx" ON "FormTrigger"("formId");

-- CreateIndex
CREATE INDEX "Tag_environmentId_idx" ON "Tag"("environmentId");

-- CreateIndex
CREATE INDEX "TagsOnResponses_responseId_idx" ON "TagsOnResponses"("responseId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Webhook_environmentId_idx" ON "Webhook"("environmentId");

-- RenameIndex
ALTER INDEX "email_teamId_unique" RENAME TO "Invite_email_teamId_idx";
