// Schema for Mongoose
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChangeRequestDocument = ChangeRequest & Document;

@Schema({ collection: 'change_requests' })
export class ChangeRequest {
  @Prop({ type: String, required: true, unique: true })
  change_request_id: string; // A unique id to identify the change request

  @Prop({ type: String, required: true, unique: true })
  token: string; // A unique token that will be sent to the user via email

  @Prop({ type: String, required: true })
  user_id: string; // The ID of the user making the request

  @Prop({ type: String, required: true, enum: ['change_password', 'change_email'] })
  request_type: string; // Indicates whether it is a password or email change request

  @Prop({ type: String, required: true })
  new_value: string; // The new password or new email

  @Prop({ type: Date, required: true, default: Date.now })
  created_at: Date; // The date and time when the request was created

  @Prop({ type: Date, required: true, default: Date.now })
  expires_at: Date; // The expiration date of the request
}

// Create the schema from the ChangeRequest class
export const ChangeRequestSchema = SchemaFactory.createForClass(ChangeRequest);

// Middleware to set expires_at when creating a document
ChangeRequestSchema.pre<ChangeRequestDocument>('save', function(next) {
  this.expires_at = new Date(Date.now() + 60 * 60 * 1000); // Sets the expiration to 1 hour
  next();
});

// Create the TTL index
ChangeRequestSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

