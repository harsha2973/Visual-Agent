import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from typing import Dict, Any, Optional
from app.config import settings

class S3Service:
    def __init__(self):
        self.bucket_name = settings.s3_bucket_name
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            region_name=settings.s3_region,
            config=Config(signature_version="s3v4"),
        )

    def ensure_bucket_exists(self) -> None:
        """Create bucket if it does not exist."""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            except Exception as e:
                print(f"[S3Service] Warning creating bucket: {e}")

    def upload_file_bytes(
        self,
        file_bytes: bytes,
        object_key: str,
        content_type: str = "image/jpeg",
        metadata: Optional[Dict[str, str]] = None,
    ) -> str:
        """Upload raw bytes to S3 and return the public/presigned URL."""
        self.ensure_bucket_exists()
        extra_args: Dict[str, Any] = {"ContentType": content_type}
        if metadata:
            extra_args["Metadata"] = metadata

        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=object_key,
            Body=file_bytes,
            **extra_args
        )
        return f"{settings.s3_endpoint_url}/{self.bucket_name}/{object_key}"

    def generate_presigned_post(
        self,
        object_key: str,
        content_type: str = "image/jpeg",
        expires_in: int = 3600,
    ) -> Dict[str, Any]:
        """Generate a presigned S3 POST URL for direct client upload."""
        self.ensure_bucket_exists()
        return self.s3_client.generate_presigned_post(
            Bucket=self.bucket_name,
            Key=object_key,
            Fields={"Content-Type": content_type},
            Conditions=[{"Content-Type": content_type}],
            ExpiresIn=expires_in,
        )

    def delete_object(self, object_key: str) -> bool:
        """Delete an object from S3 bucket."""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=object_key)
            return True
        except Exception as e:
            print(f"[S3Service] Error deleting object {object_key}: {e}")
            return False

s3_service = S3Service()
